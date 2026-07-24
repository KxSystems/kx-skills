# kx-formbuilder — NLQ Regression Tests

> Retest these queries on every MR that changes this skill. Back to [SKILL.md](../SKILL.md).

**Contents:** 16 retestable NLQ → expected-output cases

---

NLQ TEST CASES — retestable queries for MR validation
======================================================

1. Simple symbol input form
   NLQ: "Create a form with a symbol text field for ticker symbol and a submit button, connected to a data source called tradeQuery on connection tradefeed"
   Expected: FormBuilder with one symbol Element, StateOutput Trigger=Submit writing to a ViewState, Actions Trigger=Submit re-executing tradeQuery.

2. Form with multiple kdb types
   NLQ: "Build a form that takes a stock symbol (symbol), a trade date (date), a quantity (int), and a price (float) as inputs"
   Expected: Four Elements with types symbol, date, int, float respectively.

3. Dropdown (list) form
   NLQ: "Add a form with a dropdown for side (Buy/Sell) and a symbol text input"
   Expected: FormBuilder with a list Element (Items: [{Value:'Buy',Text:'Buy'},{Value:'Sell',Text:'Sell'}]) and a symbol Element.

4. Data-source-backed dropdown
   NLQ: "Create a form with a symbol dropdown populated from a data source called SymbolList (sym column for both value and text)"
   Expected: list Element with Data bound to SymbolList, DataSourceMapping.Value='sym', DataSourceMapping.Text='sym'.

5. Multi-select dropdown
   NLQ: "Build a form with a multi-select list for currency (USD, EUR, GBP)"
   Expected: list Element with multiSelect=true, Items array.

6. Password field
   NLQ: "Create a login form with a username (symbol) and a password field"
   Expected: symbol Element with password=true for the password field.

7. Form with validation
   NLQ: "Add a required validator and an email validator to the email input field"
   Expected: string Element with validators: [{type:'required',...},{type:'email',...}].

8. Form with grouped fields
   NLQ: "Create a form with two sections: Trade Details (symbol, quantity) and Settlement (date, currency)"
   Expected: Two group Elements each containing child Elements.

9. Row layout group
   NLQ: "Put the symbol and quantity fields side by side in a row"
   Expected: group Element with layout='Row' containing symbol and int Elements.

10. Hidden and disabled fields
    NLQ: "Pre-fill the portfolio ID but hide it from the user. Disable the price field."
    Expected: Element with hidden=true for portfolio ID, Element with disabled=true for price.

11. StateOutput on Submit
    NLQ: "When the user submits, write the form values to a ViewState called FormOutput"
    Expected: StateOutput entry Trigger=Submit, Target=FormOutput ViewState binding.

12. Actions on Submit
    NLQ: "When the user submits the form, re-execute the data source called queryResults"
    Expected: Actions entry Trigger=Submit, _Type=query, DataSource bound to queryResults.

13. Cancel action
    NLQ: "Add a Cancel button that navigates back to the Overview screen"
    Expected: Actions entry Trigger=Cancel, _Type=nav.

14. Form with kdb schema binding
    NLQ: "Bind the form schema to a ViewState called FormSchema that a kdb process updates dynamically"
    Expected: Basics.FormDefinition bound to FormSchema ViewState.

15. Hide submit/cancel buttons
    NLQ: "Create a form that auto-submits on change without showing Submit or Cancel buttons"
    Expected: Style.HideSubmit=true, Style.HideCancel=true, Actions Trigger=Change.

16. Horizontal row layout form
    NLQ: "Create an inline form with all fields displayed in a single row"
    Expected: Style.Layout='Row'.