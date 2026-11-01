CLASS zcl_rb_ap_analytics DEFINITION
  PUBLIC FINAL CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
ENDCLASS.

CLASS zcl_rb_ap_analytics IMPLEMENTATION.
  METHOD if_oo_adt_classrun~main.
    TYPES: BEGIN OF ty_aging,
             bucket TYPE string,
             invoice_count TYPE i,
             amount TYPE zrb_ap_invoice-gross_amount,
           END OF ty_aging.
    TYPES: BEGIN OF ty_forecast,
             period TYPE string,
             invoice_count TYPE i,
             amount TYPE zrb_ap_invoice-gross_amount,
           END OF ty_forecast.
    TYPES: BEGIN OF ty_duplicate,
             vendor_id TYPE zrb_ap_invoice-vendor_id,
             invoice_number TYPE zrb_ap_invoice-invoice_number,
             invoice_date TYPE zrb_ap_invoice-invoice_date,
             gross_amount TYPE zrb_ap_invoice-gross_amount,
             currency_code TYPE zrb_ap_invoice-currency_code,
             invoice_count TYPE i,
           END OF ty_duplicate.

    DATA(today) = cl_abap_context_info=>get_system_date( ).
    DATA aging TYPE STANDARD TABLE OF ty_aging WITH EMPTY KEY.
    DATA forecast TYPE STANDARD TABLE OF ty_forecast WITH EMPTY KEY.
    DATA duplicates TYPE STANDARD TABLE OF ty_duplicate WITH EMPTY KEY.
    DATA(open_count) = 0.
    DATA(paid_count) = 0.
    DATA open_amount TYPE zrb_ap_invoice-gross_amount.
    DATA overdue_amount TYPE zrb_ap_invoice-gross_amount.

    aging = VALUE #(
      ( bucket = 'Current' )
      ( bucket = '1-30 days overdue' )
      ( bucket = '31-60 days overdue' )
      ( bucket = '61-90 days overdue' )
      ( bucket = 'Over 90 days overdue' ) ).
    forecast = VALUE #(
      ( period = 'Due within 7 days' )
      ( period = 'Due in 8-30 days' )
      ( period = 'Due in 31-60 days' )
      ( period = 'Due after 60 days' ) ).

    SELECT * FROM zrb_ap_invoice
      WHERE currency_code = 'USD'
      INTO TABLE @DATA(invoices).

    LOOP AT invoices INTO DATA(invoice).
      IF invoice-status = 'P'.
        paid_count += 1.
        CONTINUE.
      ENDIF.
      IF invoice-status <> 'O'.
        CONTINUE.
      ENDIF.

      open_count += 1.
      open_amount += invoice-gross_amount.

      DATA(aging_index) = 1.
      IF invoice-due_date < today.
        overdue_amount += invoice-gross_amount.
        DATA(days_overdue) = today - invoice-due_date.
        IF days_overdue <= 30.
          aging_index = 2.
        ELSEIF days_overdue <= 60.
          aging_index = 3.
        ELSEIF days_overdue <= 90.
          aging_index = 4.
        ELSE.
          aging_index = 5.
        ENDIF.
      ENDIF.
      aging[ aging_index ]-invoice_count += 1.
      aging[ aging_index ]-amount += invoice-gross_amount.

      DATA(forecast_index) = 0.
      IF invoice-due_date >= today.
        DATA(days_until_due) = invoice-due_date - today.
        IF days_until_due <= 7.
          forecast_index = 1.
        ELSEIF days_until_due <= 30.
          forecast_index = 2.
        ELSEIF days_until_due <= 60.
          forecast_index = 3.
        ELSE.
          forecast_index = 4.
        ENDIF.
      ENDIF.
      IF forecast_index > 0.
        forecast[ forecast_index ]-invoice_count += 1.
        forecast[ forecast_index ]-amount += invoice-gross_amount.
      ENDIF.
    ENDLOOP.

    SELECT vendor_id, invoice_number, invoice_date, gross_amount,
           currency_code, COUNT( * ) AS invoice_count
      FROM zrb_ap_invoice
      WHERE currency_code = 'USD'
      GROUP BY vendor_id, invoice_number, invoice_date, gross_amount,
               currency_code
      HAVING COUNT( * ) > 1
      INTO TABLE @duplicates.

    out->write( |USD invoice analytics as of { today DATE = ISO }| ).
    out->write( |Open invoices: { open_count }| ).
    out->write( |Paid invoices: { paid_count }| ).
    out->write( |Open amount: { open_amount }| ).
    out->write( |Overdue amount: { overdue_amount }| ).
    out->write( data = aging name = 'AP aging' ).
    out->write( data = forecast name = 'Upcoming payments' ).
    out->write( data = duplicates name = 'Potential duplicates' ).
  ENDMETHOD.
ENDCLASS.
