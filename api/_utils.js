// api/_utils.js
import { requireSignin } from '../server/controllers/authController.js';

/**
 * Read and parse a JSON body from a Node IncomingMessage.
 */
export function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      if (!data) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Generic helper to:
 *  - parse JSON body (if any)
 *  - run requireSignin (JWT auth)
 *  - call an Express-style controller function: (req, res, next)
 */
export async function handleController(req, res, controllerFn) {
  try {
    // ✅ Parse JSON body only for typical body methods
    const hasBodyMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    if (hasBodyMethod && req.headers['content-type']?.includes('application/json')) {
      req.body = await parseJsonBody(req);
    } else {
      req.body = req.body || {};
    }
  } catch (err) {
    console.error('JSON parse error:', err);
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // ✅ Wrap requireSignin and controller in a Promise
  return new Promise((resolve) => {
    requireSignin(req, res, (authErr) => {
      if (authErr) {
        console.error('Auth error:', authErr);
        res.status(401).json({ error: authErr.message || 'Unauthorized' });
        return resolve();
      }

      controllerFn(req, res, (controllerErr) => {
        if (controllerErr) {
          console.error('Controller error:', controllerErr);
          const status = controllerErr.status || 500;
          res
            .status(status)
            .json({ error: controllerErr.message || 'Server error' });
        }
        resolve();
      });
    });
  });
}