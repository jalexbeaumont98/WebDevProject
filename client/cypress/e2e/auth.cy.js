// cypress/e2e/auth.cy.js
//
// End-to-end auth flow for Guessr:
//  - Visit signup
//  - Create a new user
//  - Redirected to login
//  - Log in with same credentials
//  - See name + Logout in navbar
//  - Log out
//  - Log back in again to confirm persistence
//
// Assumes you have these data-cy attributes in your React components:
//
// Signup page:
//   <input data-cy="signup-name" />
//   <input data-cy="signup-displayName" />   // optional; spec falls back to name if you omit this
//   <input data-cy="signup-email" />
//   <input data-cy="signup-password" />
//   <button data-cy="signup-submit">Sign Up</button>
//
// Login page:
//   <input data-cy="login-email" />
//   <input data-cy="login-password" />
//   <button data-cy="login-submit">Sign In</button>
//
// Navbar (when logged OUT):
//   <nav> contains "Login" and "Signup"
//
// Navbar (when logged IN):
//   <nav> contains the displayName somewhere + "Logout"

describe("Auth flow (signup, login, logout)", () => {
    // Generate a unique user per test run
    const unique = Date.now();
    const name = `TestUser_${unique}`;
    const displayName = `TD_${unique}`;
    const email = `test+${unique}@example.com`;
    const password = "Test1234!";

    it("allows a user to sign up, log in, log out, and log back in", () => {
        // 1) Go to signup page
        cy.visit("/signup");

        // 2) Fill signup form
        cy.get('[data-cy="signup-name"]').type(displayName);

        cy.get('[data-cy="signup-email"]').type(email);
        cy.get('[data-cy="signup-password"]').type(password);

        // 3) Submit signup
        cy.get('[data-cy="signup-submit"]').click();

        // 4) Expect redirect to login after successful signup
        cy.url().should("include", "/login");

        // 5) Log in with same credentials
        cy.get('[data-cy="login-email"]').type(email);
        cy.get('[data-cy="login-password"]').type(password);
        cy.get('[data-cy="login-submit"]').click();

        // 6) Expect to land on home (adjust if your app uses /home)
        cy.url().should("match", /\/($|home)/);

        // 7) Navbar should now show the user's displayName + Logout
        const expectedName = displayName || name;

        cy.get('[data-cy="nav-username"]', { timeout: 10000 })
            .should("contain", expectedName);

        cy.get('[data-cy="nav-logout"]').should("exist");

        // 8) Log out
        cy.contains(/logout/i).click();


        // 10) Log back in to confirm it still works
        cy.get('[data-cy="login-email"]').clear().type(email);
        cy.get('[data-cy="login-password"]').clear().type(password);
        cy.get('[data-cy="login-submit"]').click();

        cy.url().should("match", /\/($|home)/);

        cy.get('[data-cy="nav-username"]', { timeout: 10000 })
            .should("contain", expectedName);

        cy.get('[data-cy="nav-logout"]').should("exist");
    });
});