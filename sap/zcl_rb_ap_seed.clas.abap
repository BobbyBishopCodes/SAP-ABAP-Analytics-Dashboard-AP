CLASS zcl_rb_ap_seed DEFINITION
  PUBLIC FINAL CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
ENDCLASS.

CLASS zcl_rb_ap_seed IMPLEMENTATION.
  METHOD if_oo_adt_classrun~main.
    DATA(today) = cl_abap_context_info=>get_system_date( ).
    DATA seeds TYPE STANDARD TABLE OF zrb_ap_invoice WITH EMPTY KEY.
    seeds = VALUE #(
      ( invoice_id = 'MOCK0001' vendor_id = 'VEND001' vendor_name = 'Northstar Supply'
        invoice_number = 'NS-1001' invoice_date = today - 65 due_date = today - 35
        gross_amount = '1250.00' currency_code = 'USD' status = 'O' )
      ( invoice_id = 'MOCK0002' vendor_id = 'VEND002' vendor_name = 'Blue Ridge Parts'
        invoice_number = 'BR-2040' invoice_date = today - 50 due_date = today - 20
        gross_amount = '420.50' currency_code = 'USD' status = 'O' )
      ( invoice_id = 'MOCK0003' vendor_id = 'VEND003' vendor_name = 'Pine Logistics'
        invoice_number = 'PL-3008' invoice_date = today - 28 due_date = today + 2
        gross_amount = '875.00' currency_code = 'USD' status = 'O' )
      ( invoice_id = 'MOCK0004' vendor_id = 'VEND001' vendor_name = 'Northstar Supply'
        invoice_number = 'NS-1002' invoice_date = today - 95 due_date = today - 65
        gross_amount = '3100.00' currency_code = 'USD' status = 'O' )
      ( invoice_id = 'MOCK0005' vendor_id = 'VEND004' vendor_name = 'Summit Services'
        invoice_number = 'SS-77' invoice_date = today - 110 due_date = today - 80
        gross_amount = '640.00' currency_code = 'USD' status = 'O' )
      ( invoice_id = 'MOCK0006' vendor_id = 'VEND002' vendor_name = 'Blue Ridge Parts'
        invoice_number = 'BR-2039' invoice_date = today - 70 due_date = today - 40
        gross_amount = '220.00' currency_code = 'USD' status = 'P'
        payment_date = today - 10 )
      ( invoice_id = 'MOCK0007' vendor_id = 'VEND003' vendor_name = 'Pine Logistics'
        invoice_number = 'PL-3010' invoice_date = today - 12 due_date = today + 18
        gross_amount = '500.00' currency_code = 'USD' status = 'O' )
      ( invoice_id = 'MOCK0008' vendor_id = 'VEND003' vendor_name = 'Pine Logistics'
        invoice_number = 'PL-3010' invoice_date = today - 12 due_date = today + 18
        gross_amount = '500.00' currency_code = 'USD' status = 'O' ) ).

    DATA(inserted) = 0.
    LOOP AT seeds INTO DATA(seed).
      SELECT SINGLE invoice_id FROM zrb_ap_invoice
        WHERE invoice_id = @seed-invoice_id
        INTO @DATA(existing_id).
      IF sy-subrc <> 0.
        INSERT zrb_ap_invoice FROM @seed.
        IF sy-subrc = 0.
          inserted += 1.
        ENDIF.
      ENDIF.
    ENDLOOP.

    out->write( |Inserted { inserted } mock invoices; existing IDs were kept.| ).
  ENDMETHOD.
ENDCLASS.
