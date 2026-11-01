sap.ui.getCore().attachInit(function () {
  sap.ui.require([
    "sap/m/App", "sap/m/Page", "sap/m/VBox", "sap/m/HBox", "sap/m/Title",
    "sap/m/Text", "sap/m/Panel", "sap/m/Table", "sap/m/Column",
    "sap/m/ColumnListItem", "sap/m/ObjectNumber", "sap/m/ObjectStatus",
    "sap/m/Button", "sap/m/MessageStrip", "sap/m/Toolbar", "sap/m/ToolbarSpacer",
    "sap/m/Select", "sap/ui/core/Item", "sap/m/GenericTile", "sap/m/TileContent",
    "sap/m/NumericContent"
  ], function (App, Page, VBox, HBox, Title, Text, Panel, Table, Column,
    ColumnListItem, ObjectNumber, ObjectStatus, Button, MessageStrip, Toolbar,
    ToolbarSpacer, Select, Item, GenericTile, TileContent, NumericContent) {
    var invoices = [];
    var live = false;
    var asOf = new Date();
    var day = 86400000;
    var content = new VBox({ width: "100%" });
    var notice = new MessageStrip({ showIcon: true });
    var currency = new Select({ change: render });
    var page = new Page({
      title: "Accounts Payable Analytics",
      content: [new VBox({
        width: "100%",
        items: [new Toolbar({ content: [
          new Title({ text: "Invoice dashboard", level: "H2" }),
          new ToolbarSpacer(),
          new Text({ text: "Currency" }),
          currency,
          new Button({ text: "Refresh", icon: "sap-icon://refresh", press: load })
        ] }), notice, content]
      }).addStyleClass("sapUiResponsiveContentPadding")]
    });
    new App({ pages: [page] }).placeAt("content");

    function dateAt(offset) {
      var value = new Date(asOf);
      value.setHours(12, 0, 0, 0);
      value.setDate(value.getDate() + offset);
      return value.toISOString().slice(0, 10);
    }

    function dateText(value) {
      if (!value) { return ""; }
      if (typeof value === "string" && /^\d{8}$/.test(value)) {
        return value.slice(0, 4) + "-" + value.slice(4, 6) + "-" + value.slice(6);
      }
      return String(value).slice(0, 10);
    }

    function daysFromToday(value) {
      var today = new Date(asOf);
      today.setHours(12, 0, 0, 0);
      var due = new Date(dateText(value) + "T12:00:00");
      return Math.round((due - today) / day);
    }

    function money(value) {
      return Number(value || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      });
    }

    function tile(label, value, unit) {
      return new GenericTile({
        header: label,
        tileContent: [new TileContent({
          content: new NumericContent({ value: String(value), scale: unit || "" })
        })]
      }).addStyleClass("sapUiTinyMarginEnd sapUiTinyMarginBottom");
    }

    function summaryTable(title, rows, columns) {
      return new Panel({
        headerText: title,
        expandable: true,
        expanded: true,
        content: [new Table({
          columns: columns.map(function (name) {
            return new Column({ header: new Text({ text: name }) });
          }),
          items: rows.map(function (row) {
            return new ColumnListItem({ cells: row.map(function (value) {
              return new Text({ text: String(value) });
            }) });
          })
        })]
      }).addStyleClass("sapUiSmallMarginBottom");
    }

    function render() {
      var code = currency.getSelectedKey();
      if (!code) { return; }
      var rows = invoices.filter(function (invoice) {
        return invoice.CurrencyCode === code;
      });
      var open = rows.filter(function (invoice) { return invoice.Status === "O"; });
      var paid = rows.filter(function (invoice) { return invoice.Status === "P"; });
      var overdue = open.filter(function (invoice) {
        return daysFromToday(invoice.DueDate) < 0;
      });
      var sum = function (items) {
        return items.reduce(function (total, invoice) {
          return total + Number(invoice.GrossAmount || 0);
        }, 0);
      };
      var agingLabels = ["Current", "1–30 days", "31–60 days", "61–90 days", "Over 90 days"];
      var aging = agingLabels.map(function (label) { return { label: label, items: [] }; });
      var forecastLabels = ["Due within 7 days", "Due in 8–30 days", "Due in 31–60 days", "Due after 60 days"];
      var forecast = forecastLabels.map(function (label) { return { label: label, items: [] }; });
      var groups = {};

      open.forEach(function (invoice) {
        var remaining = daysFromToday(invoice.DueDate);
        var age = -remaining;
        var agingIndex = age <= 0 ? 0 : age <= 30 ? 1 : age <= 60 ? 2 : age <= 90 ? 3 : 4;
        aging[agingIndex].items.push(invoice);
        if (remaining >= 0) {
          var forecastIndex = remaining <= 7 ? 0 : remaining <= 30 ? 1 : remaining <= 60 ? 2 : 3;
          forecast[forecastIndex].items.push(invoice);
        }
      });

      rows.forEach(function (invoice) {
        var key = [invoice.VendorId, invoice.InvoiceNumber, invoice.InvoiceDate,
          invoice.GrossAmount, invoice.CurrencyCode].join("|");
        if (!groups[key]) { groups[key] = []; }
        groups[key].push(invoice);
      });
      var duplicates = Object.keys(groups).map(function (key) { return groups[key]; })
        .filter(function (group) { return group.length > 1; });

      content.removeAllItems();
      content.addItem(new HBox({ wrap: "Wrap", items: [
        tile("Open invoices", open.length),
        tile("Open amount", money(sum(open)), code),
        tile("Overdue amount", money(sum(overdue)), code),
        tile("Paid invoices", paid.length),
        tile("Potential duplicate groups", duplicates.length)
      ] }));
      content.addItem(summaryTable("AP aging", aging.map(function (bucket) {
        return [bucket.label, bucket.items.length, money(sum(bucket.items)) + " " + code];
      }), ["Bucket", "Invoices", "Amount"]));
      content.addItem(summaryTable("Upcoming payment obligations", forecast.map(function (bucket) {
        return [bucket.label, bucket.items.length, money(sum(bucket.items)) + " " + code];
      }), ["Due", "Invoices", "Amount"]));
      content.addItem(summaryTable("Potential duplicates", duplicates.map(function (group) {
        return [group.map(function (invoice) { return invoice.InvoiceId; }).join(", "),
          group[0].VendorName, group[0].InvoiceNumber, money(group[0].GrossAmount) + " " + code];
      }), ["Invoice IDs", "Vendor", "Invoice number", "Amount"]));

      var invoiceTable = new Table({ columns: ["ID", "Vendor", "Invoice number", "Due date", "Amount", "Status"].map(function (name) {
        return new Column({ header: new Text({ text: name }) });
      }) });
      rows.forEach(function (invoice) {
        invoiceTable.addItem(new ColumnListItem({ cells: [
          new Text({ text: invoice.InvoiceId }),
          new Text({ text: invoice.VendorName }),
          new Text({ text: invoice.InvoiceNumber }),
          new Text({ text: dateText(invoice.DueDate) }),
          new ObjectNumber({ number: money(invoice.GrossAmount), unit: code }),
          new ObjectStatus({ text: invoice.Status === "P" ? "Paid" : "Open",
            state: invoice.Status === "P" ? "Success" : "Warning" })
        ] }));
      });
      content.addItem(new Panel({ headerText: "Invoices", content: [invoiceTable] }));
      notice.setText((live ? "SAP service data" : "Local sample data") + " · As of " + dateAt(0) +
        " · Payment outlook excludes overdue invoices · Read-only dashboard");
      notice.setType(live ? "Success" : "Information");
    }

    function accept(data, isLive) {
      invoices = data;
      live = isLive;
      var selected = currency.getSelectedKey();
      var codes = Array.from(new Set(data.map(function (invoice) {
        return invoice.CurrencyCode;
      }))).sort();
      currency.removeAllItems();
      codes.forEach(function (code) { currency.addItem(new Item({ key: code, text: code })); });
      currency.setSelectedKey(codes.indexOf(selected) >= 0 ? selected : codes[0]);
      render();
    }

    function load() {
      var service = new URLSearchParams(location.search).get("service");
      var source = service ? service.replace(/\/$/, "") + "/Invoices?$top=1000" : "mock-invoices.json";
      function fetchPage(url, accumulated) {
        return fetch(url, { credentials: "same-origin", headers: { Accept: "application/json" } })
          .then(function (response) {
            if (!response.ok) { throw new Error("HTTP " + response.status); }
            return response.json();
          })
          .then(function (data) {
            if (!service) { return data; }
            var rows = accumulated.concat(data.value || []);
            var next = data["@odata.nextLink"];
            return next ? fetchPage(new URL(next, url).href, rows) : rows;
          });
      }
      fetchPage(source, [])
        .then(function (data) {
          if (service) {
            accept(data, true);
          } else {
            accept(data.map(function (invoice) {
              return Object.assign({}, invoice, {
                InvoiceDate: dateAt(invoice.InvoiceDateOffset),
                DueDate: dateAt(invoice.DueDateOffset),
                PaymentDate: invoice.PaymentDateOffset === undefined ? null : dateAt(invoice.PaymentDateOffset)
              });
            }), false);
          }
        })
        .catch(function (error) {
          notice.setText("Could not load invoices: " + error.message);
          notice.setType("Error");
        });
    }

    load();
  });
});
