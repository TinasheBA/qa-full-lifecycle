# Test Cases — SauceDemo Checkout Flow

> Executable manual test cases. Each is traceable to a requirement in `requirements.md`
> via the `Ref` column, and tracked in `traceability-matrix.md`.

## Login

### TC-01 — Valid login
- **Ref:** REQ-1.1
- **Preconditions:** Open `https://www.saucedemo.com/`
- **Steps:**
  1. Enter username `standard_user`
  2. Enter password `secret_sauce`
  3. Click **Login**
- **Expected:** Lands on inventory page; URL contains `inventory.html`.

### TC-02 — Invalid login rejected
- **Ref:** REQ-1.2
- **Steps:**
  1. Enter username `standard_user`
  2. Enter password `wrong-password`
  3. Click **Login**
- **Expected:** Error message appears ("Username and password do not match"); stays on
  login page.

### TC-03 — Locked-out user blocked
- **Ref:** REQ-1.3
- **Steps:**
  1. Enter username `locked_out_user`
  2. Enter password `secret_sauce`
  3. Click **Login**
- **Expected:** Error message explains the user is locked out.

## Inventory

### TC-04 — Product details displayed
- **Ref:** REQ-2.1
- **Steps:**
  1. Log in as `standard_user`
  2. Observe the inventory list
- **Expected:** Each product shows name, description, and price.

### TC-05 — Add item updates cart
- **Ref:** REQ-2.2
- **Steps:**
  1. Log in as `standard_user`
  2. Click **Add to cart** on "Sauce Labs Backpack"
- **Expected:** Cart badge shows `1`; button changes to **Remove**.

### TC-06 — Duplicate add prevented
- **Ref:** REQ-2.3
- **Steps:**
  1. Log in; add "Sauce Labs Backpack"
  2. Check the inventory row
- **Expected:** Button is now **Remove** (cannot add twice).

## Cart

### TC-07 — Cart lists added item
- **Ref:** REQ-3.1
- **Steps:**
  1. Log in; add "Sauce Labs Backpack"; add "Sauce Labs Bike Light"
  2. Open the cart
- **Expected:** Both items listed with correct price and quantity `1`.

### TC-08 — Remove from cart
- **Ref:** REQ-3.2
- **Steps:**
  1. Add "Sauce Labs Backpack"; open cart
  2. Click **Remove**
- **Expected:** Item removed; cart badge decrements.

### TC-09 — Checkout reachable
- **Ref:** REQ-3.3
- **Steps:** Open cart
- **Expected:** **Checkout** button is present.

## Checkout

### TC-10 — Happy path checkout
- **Ref:** REQ-4.1, REQ-4.3, REQ-4.4, REQ-4.5
- **Steps:**
  1. Log in; add "Sauce Labs Backpack"; open cart
  2. Click **Checkout**; enter First Name, Last Name, ZIP
  3. Continue → **Finish**
- **Expected:** Success message "Thank you for your order!"; cart empty afterwards.

### TC-11 — Empty first name blocks checkout
- **Ref:** REQ-4.2
- **Steps:**
  1. Log in; add item; open cart; click **Checkout**
  2. Leave First Name blank; fill rest; click **Continue**
- **Expected:** Error: "First Name is required"; does not advance.

### TC-12 — Empty last name blocks checkout
- **Ref:** REQ-4.2
- **Steps:** As TC-11 but leave Last Name blank
- **Expected:** Error: "Last Name is required".

### TC-13 — Empty postal code blocks checkout
- **Ref:** REQ-4.2
- **Steps:** As TC-11 but leave postal code blank
- **Expected:** Error: "Postal Code is required".

## Sorting (known flaw)

### TC-14 — Sort by name A→Z / Z→A available
- **Ref:** REQ-5.1
- **Steps:**
  1. Log in; switch the sort dropdown to "Name (Z to A)"
- **Expected:** The option is selectable (see BUG-001 for the defective behavior).
