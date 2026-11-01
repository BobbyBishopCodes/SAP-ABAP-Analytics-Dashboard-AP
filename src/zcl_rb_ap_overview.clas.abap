CLASS zcl_rb_ap_overview DEFINITION
  PUBLIC FINAL CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.

ENDCLASS.

CLASS zcl_rb_ap_overview IMPLEMENTATION.

  METHOD if_oo_adt_classrun~main.
    out->write( 'Accounts Payable Analytics' ).
  ENDMETHOD.

ENDCLASS.
