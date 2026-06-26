import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.join(__dirname, 'public', 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const compareEngine = {
  // Extract detailed element information
  extractElements: async (page) => {
    const elements = await page.evaluate(() => {
      const elementList = [];
      const processed = new Set();

      // Get all visible elements with meaningful selectors
      const selectors = [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'button', 'a', 
        '[class*="button"]', '[class*="header"]', '[class*="hero"]', 
        '[class*="section"]', '[class*="card"]', '[class*="title"]', 
        'input', 'textarea', 'nav', 'footer', '[class*="cta"]', '[class*="btn"]'
      ];

      const allElements = document.querySelectorAll(selectors.join(','));

      allElements.forEach((el) => {
        // Skip if already processed or not visible
        if (processed.has(el) || el.offsetHeight === 0 || el.offsetWidth === 0) {
          return;
        }

        const style = window.getComputedStyle(el);
        const text = el.textContent?.trim().substring(0, 100) || '';

        // Skip empty elements
        if (!text && !el.id && el.classList.length === 0) {
          return;
        }

        processed.add(el);

        // Get best selector
        let selector = '';
        if (el.id) {
          selector = `#${el.id}`;
        } else if (el.classList.length > 0) {
          // Use the most specific/meaningful class
          const classes = Array.from(el.classList);
          const meaningful = classes.find(c => c.length > 2 && !c.match(/^(col|row|flex|grid)/));
          selector = meaningful ? `.${meaningful}` : `.${classes[0]}`;
        } else {
          selector = el.tagName.toLowerCase();
        }

        const elementData = {
          selector,
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          classes: Array.from(el.classList),
          text: text.substring(0, 50),
          
          // Typography
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          textAlign: style.textAlign,
          textTransform: style.textTransform,
          
          // Colors
          color: style.color,
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          
          // Spacing
          paddingTop: style.paddingTop,
          paddingBottom: style.paddingBottom,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
          marginTop: style.marginTop,
          marginBottom: style.marginBottom,
          marginLeft: style.marginLeft,
          marginRight: style.marginRight,
          
          // Layout
          width: style.width,
          height: style.height,
          display: style.display,
          
          // Border & Effects
          border: style.border,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          opacity: style.opacity,
        };

        elementList.push(elementData);
      });

      return elementList;
    });

    return elements;
  },

  // Take screenshot
  takeScreenshot: async (page, filename) => {
    const filepath = path.join(screenshotsDir, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    return `/screenshots/${filename}`;
  },

  // Match elements between pages using multiple strategies
  matchElements: (refElements, targetElements) => {
    const matched = [];
    const refUsed = new Set();
    const targetUsed = new Set();

    // Strategy 1: Match by ID (most specific)
    refElements.forEach((refEl, refIdx) => {
      if (!refEl.id || refUsed.has(refIdx)) return;

      const targetIdx = targetElements.findIndex(
        (tEl, idx) => !targetUsed.has(idx) && tEl.id === refEl.id
      );

      if (targetIdx !== -1) {
        matched.push({ reference: refEl, target: targetElements[targetIdx] });
        refUsed.add(refIdx);
        targetUsed.add(targetIdx);
      }
    });

    // Strategy 2: Match by class names
    refElements.forEach((refEl, refIdx) => {
      if (refUsed.has(refIdx) || refEl.classes.length === 0) return;

      const targetIdx = targetElements.findIndex((tEl, idx) => {
        if (targetUsed.has(idx)) return false;
        const overlap = refEl.classes.filter(c => tEl.classes.includes(c));
        return overlap.length > 0;
      });

      if (targetIdx !== -1) {
        matched.push({ reference: refEl, target: targetElements[targetIdx] });
        refUsed.add(refIdx);
        targetUsed.add(targetIdx);
      }
    });

    // Strategy 3: Match by tag and text similarity
    refElements.forEach((refEl, refIdx) => {
      if (refUsed.has(refIdx)) return;

      const targetIdx = targetElements.findIndex((tEl, idx) => {
        if (targetUsed.has(idx)) return false;
        const tagMatch = tEl.tag === refEl.tag;
        const textMatch = tEl.text.substring(0, 20) === refEl.text.substring(0, 20);
        return tagMatch && textMatch;
      });

      if (targetIdx !== -1) {
        matched.push({ reference: refEl, target: targetElements[targetIdx] });
        refUsed.add(refIdx);
        targetUsed.add(targetIdx);
      }
    });

    return matched;
  },

  // Analyze style differences
  analyzeDifferences: (matched) => {
    const issues = {
      typography: [],
      colors: [],
      spacing: [],
      layout: [],
      buttons: [],
      images: []
    };

    const cssRules = {};
    let totalDifferences = 0;

    matched.forEach(({ reference, target }) => {
      const selector = reference.selector;

      if (!cssRules[selector]) {
        cssRules[selector] = [];
      }

      // Typography
      const typographyProps = ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign'];

      typographyProps.forEach(prop => {
        if (reference[prop] !== target[prop] && reference[prop]) {
          issues.typography.push({
            selector,
            property: prop,
            reference: reference[prop],
            target: target[prop],
            suggested: reference[prop]
          });
          cssRules[selector].push({ prop, value: reference[prop] });
          totalDifferences++;
        }
      });

      // Colors
      const colorProps = ['color', 'backgroundColor', 'borderColor'];

      colorProps.forEach(prop => {
        if (reference[prop] !== target[prop] && reference[prop] && reference[prop] !== 'rgba(0, 0, 0, 0)') {
          issues.colors.push({
            selector,
            property: prop,
            reference: reference[prop],
            target: target[prop],
            suggested: reference[prop]
          });
          cssRules[selector].push({ prop, value: reference[prop] });
          totalDifferences++;
        }
      });

      // Spacing
      const spacingProps = ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'marginTop', 'marginBottom'];

      spacingProps.forEach(prop => {
        if (reference[prop] !== target[prop] && reference[prop]) {
          issues.spacing.push({
            selector,
            property: prop,
            reference: reference[prop],
            target: target[prop],
            suggested: reference[prop]
          });
          cssRules[selector].push({ prop, value: reference[prop] });
          totalDifferences++;
        }
      });

      // Layout
      const layoutProps = ['width', 'height', 'display', 'borderRadius'];

      layoutProps.forEach(prop => {
        if (reference[prop] !== target[prop] && reference[prop]) {
          issues.layout.push({
            selector,
            property: prop,
            reference: reference[prop],
            target: target[prop],
            suggested: reference[prop]
          });
          cssRules[selector].push({ prop, value: reference[prop] });
          totalDifferences++;
        }
      });

      // Buttons
      if (reference.tag === 'button' || reference.classes.some(c => c.includes('btn') || c.includes('button'))) {
        const btnProps = ['backgroundColor', 'color', 'borderRadius', 'fontSize'];
        
        btnProps.forEach(prop => {
          if (reference[prop] !== target[prop] && reference[prop]) {
            issues.buttons.push({
              selector,
              property: prop,
              reference: reference[prop],
              target: target[prop],
              suggested: reference[prop]
            });
            cssRules[selector].push({ prop, value: reference[prop] });
            totalDifferences++;
          }
        });
      }
    });

    return { issues, cssRules, totalDifferences };
  },

  // Generate detailed CSS fixes
  generateCSSFixes: (cssRules) => {
    let css = '/* Pixel Compare Pro - CSS Fixes */\n\n';

    Object.entries(cssRules).forEach(([selector, rules]) => {
      if (rules.length === 0) return;

      css += `${selector} {\n`;
      rules.forEach(({ prop, value }) => {
        const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
        css += `  ${cssProp}: ${value};\n`;
      });
      css += '}\n\n';
    });

    return css;
  },

  // Generate detailed fix list with selectors
  generateDetailedFixes: (issues) => {
    const fixes = [];

    // Process all issue types
    Object.entries(issues).forEach(([category, items]) => {
      items.forEach(issue => {
        fixes.push({
          selector: issue.selector,
          category,
          property: issue.property,
          reference: issue.reference,
          target: issue.target,
          suggested: issue.suggested,
          cssLine: `${issue.property.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${issue.suggested};`
        });
      });
    });

    return fixes;
  },

  // Calculate accurate match score
  calculateMatchScore: (refElements, targetElements, totalDifferences, urlsIdentical) => {
    if (refElements.length === 0 || targetElements.length === 0) {
      return 0;
    }

    // If same URL
    if (urlsIdentical && totalDifferences === 0) {
      return 100;
    }

    if (urlsIdentical && totalDifferences > 0) {
      return Math.max(80, 100 - (totalDifferences * 2));
    }

    // Element match
    const minElements = Math.min(refElements.length, targetElements.length);
    const maxElements = Math.max(refElements.length, targetElements.length);
    const elementMatch = (minElements / maxElements) * 100;

    // Style match
    const totalStyleProperties = Math.max(refElements.length * 20, 1);
    const styleDifference = (totalDifferences / totalStyleProperties) * 100;
    const styleMatch = Math.max(0, 100 - styleDifference);

    // Combined score
    const finalScore = (elementMatch * 0.4) + (styleMatch * 0.6);
    return Math.round(Math.max(0, Math.min(100, finalScore)));
  },

  // Main comparison function
  compareWebsites: async (referenceUrl, targetUrl) => {
    let browser = null;
    let context = null;

    try {
      const urlsIdentical = referenceUrl === targetUrl;

      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
      });

      // Reference page
      const refPage = await context.newPage();
      try {
        await refPage.goto(referenceUrl, { waitUntil: 'networkidle', timeout: 30000 });
      } catch (error) {
        console.log('Reference URL warning:', error.message);
      }

      await refPage.waitForTimeout(2000);
      const refScreenshot = await compareEngine.takeScreenshot(refPage, `ref_${Date.now()}.png`);
      const refElements = await compareEngine.extractElements(refPage);

      // Target page
      const targetPage = await context.newPage();
      try {
        await targetPage.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
      } catch (error) {
        console.log('Target URL warning:', error.message);
      }

      await targetPage.waitForTimeout(2000);
      const targetScreenshot = await compareEngine.takeScreenshot(targetPage, `target_${Date.now()}.png`);
      const targetElements = await compareEngine.extractElements(targetPage);

      // Analysis
      const matched = compareEngine.matchElements(refElements, targetElements);
      const analysis = compareEngine.analyzeDifferences(matched);
      const cssFixes = compareEngine.generateCSSFixes(analysis.cssRules);
      const detailedFixes = compareEngine.generateDetailedFixes(analysis.issues);

      // Score
      let matchScore = compareEngine.calculateMatchScore(
        refElements,
        targetElements,
        analysis.totalDifferences,
        urlsIdentical
      );

      await refPage.close();
      await targetPage.close();

      return {
        success: true,
        matchScore,
        referenceScreenshot: refScreenshot,
        targetScreenshot: targetScreenshot,
        refElementsCount: refElements.length,
        targetElementsCount: targetElements.length,
        matchedElementsCount: matched.length,
        totalDifferences: analysis.totalDifferences,
        issues: analysis.issues,
        detailedFixes,
        cssFixes,
        cssRules: analysis.cssRules,
        analysis: {
          typographyCount: analysis.issues.typography.length,
          colorCount: analysis.issues.colors.length,
          spacingCount: analysis.issues.spacing.length,
          layoutCount: analysis.issues.layout.length,
          buttonCount: analysis.issues.buttons.length,
          imageCount: analysis.issues.images.length
        }
      };
    } catch (error) {
      console.error('Comparison error:', error);
      return {
        success: false,
        error: error.message || 'Comparison failed'
      };
    } finally {
      try {
        if (context) await context.close();
        if (browser) await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
};

export default compareEngine;
