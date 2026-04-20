(() => {
  const ROW_SELECTOR = "div.styles__exposurePlayerCell__lncu4";
  const INFO_SELECTOR = ".styles__playerInfo__dV3qn";
  const RIGHT_SELECTOR = ".styles__rightSide__DWaFd";

  function cleanLines(text) {
    return text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);
  }

  function parseRow(row) {
    const infoLines = cleanLines(row.querySelector(INFO_SELECTOR)?.innerText || "");
    const rightLines = cleanLines(row.querySelector(RIGHT_SELECTOR)?.innerText || "");

    const name = infoLines[0] || "";
    const positionRank = infoLines.find(line => /^(QB|RB|WR|TE)\d+$/.test(line)) || "";
    const team = infoLines.find(line => /^[A-Z]{2,3}$/.test(line)) || "";
    const entryFee = rightLines.find(line => /^\$\d+(\.\d+)?$/.test(line)) || "";
    const exposure = rightLines.find(line => /^\d+(\.\d+)?%$/.test(line)) || "";

    return {
      name,
      team,
      position: positionRank.match(/^(QB|RB|WR|TE)/)?.[0] || "",
      positionRank,
      entryFee,
      exposure,
      exposureValue: exposure ? parseFloat(exposure) : null
    };
  }

  const data = Array.from(document.querySelectorAll(ROW_SELECTOR))
    .map(parseRow)
    .filter(row => row.name && row.positionRank && row.exposure);

  const byNameTeam = Object.fromEntries(
    data.map(player => [`${player.name}|${player.team}`, player])
  );

  const payload = {
    savedAt: new Date().toISOString(),
    source: window.location.href,
    count: data.length,
    players: data,
    byName: Object.fromEntries(data.map(player => [player.name, player])),
    byNameTeam
  };

  localStorage.setItem("bbExposureData", JSON.stringify(payload));

})();
