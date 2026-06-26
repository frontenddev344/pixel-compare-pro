app.post("/api/comparisons/create", authMiddleware, async (req, res) => {
  try {
    const { referenceUrl, targetUrl } = req.body;

    if (!referenceUrl || !targetUrl) {
      return res.status(400).json({ error: "Both URLs required" });
    }

    new URL(referenceUrl);
    new URL(targetUrl);

    let result;
    try {
      result = await compareEngine.compareWebsites(referenceUrl, targetUrl);
    } catch (err) {
      console.error("Compare engine error:", err);
      return res.status(500).json({
        error: "Comparison engine failed",
        details: err.message,
      });
    }

    if (!result || !result.success) {
      return res.status(400).json({
        error: result?.error || "Comparison failed",
      });
    }

    const comparison = db.createComparison(req.userId, {
      referenceUrl,
      targetUrl,
      matchScore: result.matchScore || 0,
      referenceScreenshot: result.referenceScreenshot || "",
      targetScreenshot: result.targetScreenshot || "",
      typographyIssues: result.typographyIssues || [],
      colorIssues: result.colorIssues || [],
      spacingIssues: result.spacingIssues || [],
      layoutIssues: result.layoutIssues || [],
      totalDifferences: result.totalDifferences || 0,
      cssFixes: result.cssFixes || [],
    });

    return res.json({
      success: true,
      comparison,
    });

  } catch (error) {
    console.error("Comparison error:", error);
    return res.status(500).json({
      error: "Comparison failed",
      details: error.message,
    });
  }
});