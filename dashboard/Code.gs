// EEG Monitoring Dashboard: Google Apps Script
// doPost receives the JSON sent by n8n; setupAll formats the sheet and builds the summary tab.

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Journal");
  var d = JSON.parse(e.postData.contents);
  sheet.appendRow([
    d.timestamp,
    d.segment_id,
    d.energie_rms,
    d.entropie_spectrale,
    d.frequence_dominante_hz,
    d.score_vraisemblance,
    d.label_reel,
    d.classification,
    d.confiance,
    d.action,
    d.prompt_version,
    d.justification
  ]);
  return ContentService.createTextOutput("OK");
}

function setupAll() {
  setupDashboard();
  addVisuals();
}

function setupDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Journal") || ss.insertSheet("Journal");
  var NAVY = "#1F2A5A";
  var MAXROW = 300;
  var headers = ["timestamp", "segment_id", "energie_rms", "entropie_spectrale", "frequence_dominante_hz", "score_vraisemblance", "label_reel", "classification", "confiance", "action", "prompt_version", "justification"];
  var widths = [190, 100, 110, 130, 170, 150, 120, 140, 100, 190, 120, 650];
  var N = headers.length;

  sheet.clear();
  sheet.clearConditionalFormatRules();
  sheet.setHiddenGridlines(true);
  sheet.setFrozenRows(1);

  sheet.getRange(1, 1, 1, N).setValues([headers])
    .setBackground(NAVY).setFontColor("#FFFFFF").setFontWeight("bold")
    .setFontSize(12).setFontFamily("Georgia")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet.setRowHeight(1, 42);

  var body = sheet.getRange(2, 1, MAXROW - 1, N);
  body.setFontFamily("Georgia").setFontSize(11)
    .setHorizontalAlignment("center").setVerticalAlignment("middle")
    .setBorder(true, true, true, true, true, true, "#D9DCE6", SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange(2, 12, MAXROW - 1, 1).setHorizontalAlignment("left").setWrap(true);

  sheet.getRange(2, 3, MAXROW - 1, 1).setNumberFormat("0.00");
  sheet.getRange(2, 4, MAXROW - 1, 1).setNumberFormat("0.000");
  sheet.getRange(2, 5, MAXROW - 1, 2).setNumberFormat("0.00");
  sheet.getRange(2, 9, MAXROW - 1, 1).setNumberFormat("0.00");

  for (var i = 0; i < N; i++) sheet.setColumnWidth(i + 1, widths[i]);

  function rule(col, text, bg, fg) {
    return SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(text).setBackground(bg).setFontColor(fg).setBold(true)
      .setRanges([sheet.getRange(2, col, MAXROW - 1, 1)]).build();
  }
  sheet.setConditionalFormatRules([
    rule(8, "CRISE", "#F4B6B6", "#8B1A1A"),
    rule(8, "NON_CRISE", "#C6E5C3", "#1E5B1E"),
    rule(10, "ALERTE_IMMEDIATE", "#F4B6B6", "#8B1A1A"),
    rule(10, "VERIFICATION_REQUISE", "#FFD8A8", "#8A4B00"),
    rule(10, "LOG_SIMPLE", "#C6E5C3", "#1E5B1E")
  ]);

  var r = ss.getSheetByName("Résumé") || ss.insertSheet("Résumé");
  r.clear();
  r.setHiddenGridlines(true);
  r.setColumnWidth(1, 280);
  r.setColumnWidth(2, 140);
  r.getRange("A1:B1").merge().setValue("EEG Monitoring Dashboard — Résumé")
    .setBackground(NAVY).setFontColor("#FFFFFF").setFontWeight("bold")
    .setFontSize(14).setFontFamily("Georgia")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  r.setRowHeight(1, 46);

  r.getRange("A3:B15").setValues([
    ["Segments traités", "=COUNTA(Journal!B2:B)"],
    ["Alertes immédiates", "=COUNTIF(Journal!J2:J,\"ALERTE_IMMEDIATE\")"],
    ["Vérifications requises", "=COUNTIF(Journal!J2:J,\"VERIFICATION_REQUISE\")"],
    ["Logs simples", "=COUNTIF(Journal!J2:J,\"LOG_SIMPLE\")"],
    ["", ""],
    ["Vrais positifs (VP)", "=COUNTIFS(Journal!G2:G,\"CRISE\",Journal!H2:H,\"CRISE\")"],
    ["Vrais négatifs (VN)", "=COUNTIFS(Journal!G2:G,\"NON_CRISE\",Journal!H2:H,\"NON_CRISE\")"],
    ["Faux positifs (FP)", "=COUNTIFS(Journal!G2:G,\"NON_CRISE\",Journal!H2:H,\"CRISE\")"],
    ["Faux négatifs (FN)", "=COUNTIFS(Journal!G2:G,\"CRISE\",Journal!H2:H,\"NON_CRISE\")"],
    ["", ""],
    ["Accuracy", "=IFERROR((B8+B9)/(B8+B9+B10+B11),0)"],
    ["Précision", "=IFERROR(B8/(B8+B10),0)"],
    ["Rappel", "=IFERROR(B8/(B8+B11),0)"]
  ]);
  r.getRange("A3:B15").setFontFamily("Georgia").setFontSize(12).setVerticalAlignment("middle");
  r.getRange("B3:B15").setHorizontalAlignment("center").setFontWeight("bold");
  r.getRange("B13:B15").setNumberFormat("0.00%");
  r.getRange("A3:B6").setBorder(true, true, true, true, false, true, "#D9DCE6", SpreadsheetApp.BorderStyle.SOLID);
  r.getRange("A8:B11").setBorder(true, true, true, true, false, true, "#D9DCE6", SpreadsheetApp.BorderStyle.SOLID);
  r.getRange("A13:B15").setBorder(true, true, true, true, false, true, "#D9DCE6", SpreadsheetApp.BorderStyle.SOLID);
}

function addVisuals() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var r = ss.getSheetByName("Résumé");
  var NAVY = "#1F2A5A";

  r.getRange("D3:F3").merge().setValue("Matrice de confusion")
    .setBackground(NAVY).setFontColor("#FFFFFF").setFontWeight("bold")
    .setFontFamily("Georgia").setFontSize(12)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  r.getRange("D4:F6").setValues([
    ["", "Prédit CRISE", "Prédit NON_CRISE"],
    ["Réel CRISE", "=B8", "=B11"],
    ["Réel NON_CRISE", "=B10", "=B9"]
  ]);
  r.getRange("D4:F6").setFontFamily("Georgia").setFontSize(12)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  r.getRange("D4:F4").setBackground("#E8EAF2").setFontWeight("bold");
  r.getRange("D5:D6").setBackground("#E8EAF2").setFontWeight("bold");
  r.getRange("E5").setBackground("#C6E5C3");
  r.getRange("F6").setBackground("#C6E5C3");
  r.getRange("F5").setBackground("#F4B6B6");
  r.getRange("E6").setBackground("#F4B6B6");
  r.getRange("E5:F6").setFontWeight("bold").setFontSize(16);
  r.getRange("D3:F6").setBorder(true, true, true, true, true, true, "#D9DCE6", SpreadsheetApp.BorderStyle.SOLID);
  r.setColumnWidth(3, 100);
  r.setColumnWidth(4, 140);
  r.setColumnWidth(5, 150);
  r.setColumnWidth(6, 170);

  var d = ss.getSheetByName("_data") || ss.insertSheet("_data");
  d.clear();
  d.getRange("A1:C1").setValues([["energie_rms", "CRISE", "NON_CRISE"]]);
  d.getRange("A2").setFormula('=ARRAYFORMULA(IF(Journal!G2:G300="",NA(),Journal!C2:C300))');
  d.getRange("B2").setFormula('=ARRAYFORMULA(IF(Journal!G2:G300="CRISE",Journal!D2:D300,NA()))');
  d.getRange("C2").setFormula('=ARRAYFORMULA(IF(Journal!G2:G300="NON_CRISE",Journal!D2:D300,NA()))');
  ss.setActiveSheet(r);
  d.hideSheet();

  r.getCharts().forEach(function (c) { r.removeChart(c); });

  var chart1 = r.newChart()
    .setChartType(Charts.ChartType.COLUMN)
    .addRange(r.getRange("A4:B6"))
    .setNumHeaders(0)
    .setOption("title", "Actions décidées par le superviseur")
    .setOption("legend", { position: "none" })
    .setOption("colors", ["#1F2A5A"])
    .setOption("width", 480)
    .setOption("height", 320)
    .setPosition(18, 1, 0, 0)
    .build();
  r.insertChart(chart1);

  var chart2 = r.newChart()
    .setChartType(Charts.ChartType.SCATTER)
    .addRange(d.getRange("A1:C300"))
    .setNumHeaders(1)
    .setOption("title", "Séparation des classes : énergie RMS vs entropie spectrale")
    .setOption("hAxis", { title: "energie_rms" })
    .setOption("vAxis", { title: "entropie_spectrale" })
    .setOption("colors", ["#C0392B", "#2E8B57"])
    .setOption("pointSize", 6)
    .setOption("width", 640)
    .setOption("height", 320)
    .setPosition(18, 4, 0, 0)
    .build();
  r.insertChart(chart2);
}
