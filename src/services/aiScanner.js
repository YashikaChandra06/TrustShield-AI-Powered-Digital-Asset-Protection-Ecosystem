/**
 * Mock AI Scanning Engine for Digital Asset Protection
 * Simulates analyzing an uploaded file for vulnerabilities, copyright risks, or sensitive data.
 */

const scanAsset = async (assetData) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Base mock scores
    let malwareScore = Math.floor(Math.random() * 20);
    let copyrightScore = Math.floor(Math.random() * 20);
    let privacyScore = Math.floor(Math.random() * 20);
    
    const flaggedIssues = [];

    // Simulate different issues based on random chance or mock file types
    if (assetData.mime_type && assetData.mime_type.includes('pdf')) {
        if (Math.random() > 0.5) {
            flaggedIssues.push("Potential embedded malicious script in PDF.");
            malwareScore += 60;
        }
        if (Math.random() > 0.4) {
            flaggedIssues.push("Contains sensitive PII (Social Security Numbers).");
            privacyScore += 70;
        }
    }

    if (assetData.mime_type && assetData.mime_type.includes('image')) {
        if (Math.random() > 0.6) {
            flaggedIssues.push("Copyright infringement risk: High similarity to known protected works.");
            copyrightScore += 75;
        }
        if (Math.random() > 0.8) {
            flaggedIssues.push("Steganography detected: Hidden payload suspected.");
            malwareScore += 50;
        }
    }

    if (assetData.mime_type && (assetData.mime_type.includes('javascript') || assetData.mime_type.includes('python') || assetData.original_name.endsWith('.js'))) {
        if (Math.random() > 0.4) {
            flaggedIssues.push("Hardcoded secrets/API keys detected.");
            privacyScore += 80;
        }
        if (Math.random() > 0.6) {
            flaggedIssues.push("Vulnerable dependency usage found.");
            malwareScore += 40;
        }
    }

    // Clamp scores to 100
    malwareScore = Math.min(malwareScore, 100);
    copyrightScore = Math.min(copyrightScore, 100);
    privacyScore = Math.min(privacyScore, 100);

    // Main risk score is an average of the highest risks
    const riskScore = Math.floor((malwareScore + copyrightScore + privacyScore) / 3);

    if (riskScore > 75) {
        flaggedIssues.push("High general risk score - manual review recommended.");
    }

    return {
        risk_score: riskScore,
        malware_score: malwareScore,
        copyright_score: copyrightScore,
        privacy_score: privacyScore,
        flagged_issues: flaggedIssues.length > 0 ? JSON.stringify(flaggedIssues) : JSON.stringify(["Clean: No issues detected."])
    };
};

module.exports = {
    scanAsset
};
