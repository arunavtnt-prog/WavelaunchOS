# Wavelaunch Studio Document Design - Fine-Tuning Guide

## What's Been Added

I've added a comprehensive **design-specification.md** file to the skill that defines professional .docx formatting standards. The skill will now automatically apply McKinsey-grade design to all documents.

---

## Design Options You Can Customize

### 1. **Typography (Font Choices)**

**Current Default:** Arial throughout (headers + body)

**Alternative Options:**

**Option A: Classic Contrast**
```
Headers: Times New Roman (serif)
Body: Arial (sans-serif)
```

**Option B: Digital Optimized**
```
Headers: Georgia (serif)
Body: Verdana (sans-serif)
```

**Option C: Modern Sans-Serif**
```
Headers: Calibri (sans-serif)
Body: Calibri (sans-serif)
```

**How to Change:**
Edit `design-specification.md` → Search for "Font Pairing" section → Update the font names in the code examples.

---

### 2. **Font Sizes**

**Current Hierarchy:**
```
Document Title: 28pt
Heading 1: 16pt
Heading 2: 14pt
Heading 3: 13pt
Body Text: 12pt
Table Text: 11pt
Captions: 10pt
```

**Options:**
- **Larger (More Impact):** Increase all by 2pt (30pt title, 18pt H1, 14pt H2, 14pt body)
- **Smaller (More Dense):** Decrease all by 1pt (26pt title, 15pt H1, 13pt H2, 11pt body)

**How to Change:**
Edit `design-specification.md` → Search for "Font Sizes" → Update the point values.

---

### 3. **Color Palette**

**Current Default:** All black text (000000) with minimal accent colors

**Brand Color Integration Options:**

**If you have brand colors**, you can integrate them sparingly:

**Option A: Colored Headers**
```
Document Title: Brand primary color (e.g., 0066CC blue)
Heading 1: Black (000000)
Heading 2: Black (000000)
Body: Black (000000)
```

**Option B: Colored Accents**
```
All text: Black
Hyperlinks: Brand primary color
Table headers: Brand primary color background
Key metrics: Brand accent color
```

**Option C: Subtle Brand Integration**
```
All text: Black
Document title page: Brand color for "Wavelaunch Studio"
Table header shading: Very light brand color (add "E0" to hex for 12% opacity)
```

**How to Change:**
Edit `design-specification.md` → Search for "Color Palette" → Add your brand colors to the palette and update usage rules.

---

### 4. **Spacing & Layout**

**Current Settings:**
- Margins: 1 inch all sides
- Paragraph spacing: 6pt after body paragraphs
- Heading spacing: 12pt before H1, 9pt before H2

**Options:**

**Tighter (More content per page):**
```
Margins: 0.75 inch
Paragraph spacing: 4pt after
```

**Looser (More readable, fewer pages):**
```
Margins: 1.25 inch
Paragraph spacing: 8pt after
```

**How to Change:**
Edit `design-specification.md` → Search for "Spacing & Layout" → Update DXA values (1440 DXA = 1 inch, 120 DXA = 6pt).

---

### 5. **Table Design**

**Current Style:** Light gray borders (CCCCCC), light gray header shading (E7E6E6)

**Alternative Styles:**

**Option A: Bold Headers**
```
Header background: Dark blue (4472C4)
Header text: White (FFFFFF)
Body: White background, light gray borders
```

**Option B: Minimalist**
```
No vertical borders (only horizontal)
No header shading (just bold text)
Very light gray horizontal rules
```

**Option C: Alternating Rows**
```
Header: Light gray
Odd rows: White (FFFFFF)
Even rows: Off-white (F8F8F8)
```

**How to Change:**
Edit `design-specification.md` → Search for "Table Design" → Update color codes and border styles.

---

### 6. **Headers & Footers**

**Current Default:**
- Header: "Wavelaunch Studio | Confidential" (right-aligned, gray)
- Footer: "Page X of Y" (center-aligned, gray)

**Customization Options:**

**Option A: Add Creator Branding**
```
Header: "[Creator Name] | Wavelaunch Studio"
Footer: Page numbers + document date
```

**Option B: Document Title in Header**
```
Header: Document title (left) | Page number (right)
Footer: Wavelaunch Studio branding
```

**Option C: Minimal**
```
Header: None
Footer: Page number only (center)
```

**How to Change:**
Edit `design-specification.md` → Search for "Headers & Footers" → Update the Header/Footer code examples.

---

### 7. **Cover Page Design**

**Current Style:**
```
Document Title (28pt, centered, bold)
Creator Name (14pt, centered)
Month/Deliverable info (12pt, centered)
---
Wavelaunch Studio (12pt, gray, centered)
Date (11pt, gray, centered)
```

**Alternative Layouts:**

**Option A: Left-Aligned Modern**
```
All text left-aligned
Larger title (36pt)
Add horizontal rule under title
Brand logo space (if you have logo)
```

**Option B: Minimal**
```
Just title + date
No branding text
Very clean
```

**Option C: Executive**
```
Title + subtitle (document purpose)
Creator name + company
"Prepared by Wavelaunch Studio"
Confidentiality notice
```

**How to Change:**
Edit `design-specification.md` → Search for "Cover Page" → Update the formatting example.

---

## Advanced Customization

### Add Brand Logo

If you have a Wavelaunch Studio logo:

```javascript
// In cover page section
new Paragraph({
  alignment: AlignmentType.CENTER,
  children: [new ImageRun({
    type: "png",
    data: fs.readFileSync("wavelaunch-logo.png"),
    transformation: { width: 200, height: 80 }
  })]
})
```

Add this to `design-specification.md` → "Cover Page" section.

### Custom Styles for Specific Elements

**Example: Add a "Key Insight" callout box style**

```javascript
paragraphStyles: [
  {
    id: "keyInsight",
    name: "Key Insight",
    basedOn: "Normal",
    run: { size: 26, bold: true, color: "0066CC" },
    paragraph: { 
      spacing: { before: 120, after: 120 },
      indent: { left: 360 },
      border: { left: { style: BorderStyle.SINGLE, size: 24, color: "0066CC" } }
    }
  }
]
```

Add this to the styles section in `design-specification.md`.

---

## How to Apply Your Custom Design

Once you've edited `design-specification.md`:

1. **Save your changes** to the file
2. **Repackage the skill:**
   ```bash
   python /mnt/skills/examples/skill-creator/scripts/package_skill.py wavelaunch-studio-creator-docs
   ```
3. **Copy to outputs:**
   ```bash
   cp wavelaunch-studio-creator-docs.skill /mnt/user-data/outputs/
   ```
4. **Re-upload** the new `.skill` file to Claude

The skill will now use your customized design for all documents.

---

## Testing Your Design

To test design changes:

1. Generate a short test document (2-3 pages)
2. Review the output .docx file
3. Check these elements:
   - Cover page layout
   - Font hierarchy (title → headers → body)
   - Table appearance
   - Header/footer placement
   - Spacing and readability
4. Iterate on `design-specification.md` as needed

---

## Quick Design Presets

### Preset 1: "Executive Minimal"
- Arial throughout
- Black text only
- No colored accents
- Minimal spacing
- Clean tables (no shading)

### Preset 2: "Brand Forward"
- Brand color in title and headers
- Brand color for key metrics
- Light brand color for table headers
- Professional but branded

### Preset 3: "Academic Formal"
- Times New Roman headers
- Arial body
- Traditional spacing
- Conservative tables
- Footnote-style citations

### Preset 4: "Tech Startup"
- Calibri throughout
- Muted blue accents
- Modern table design
- Tighter spacing
- Bold data visualization

---

## Common Customizations

**Q: Can I add company watermarks?**
A: Yes, add to header section in design-specification.md using semi-transparent text.

**Q: Can I change page orientation?**
A: Yes, update `PageOrientation.LANDSCAPE` in page setup section (though portrait is recommended).

**Q: Can I add more heading levels?**
A: Yes, add Heading4, Heading5 styles to the paragraphStyles array.

**Q: Can I integrate our brand fonts?**
A: Yes, but ensure fonts are widely available or embedded (Arr, Times New Roman, Calibri, Georgia are safest).

**Q: Can I add chart/graph templates?**
A: Tables are best for data. For complex charts, recommend external tools → insert as images.

---

## Best Practices

1. **Keep it professional:** Avoid bright colors, excessive styling, decorative fonts
2. **Test across platforms:** Open .docx in Word, Google Docs, and preview to ensure compatibility
3. **Prioritize readability:** Don't sacrifice legibility for visual flair
4. **Be consistent:** Once you pick a design system, use it across all 40 documents
5. **Less is more:** Simple, clean designs age better than trendy, complex ones

---

## Need Help?

If you want to make a specific design change and aren't sure how:

1. Describe the desired change (e.g., "I want blue headers instead of black")
2. I'll show you exactly which section of `design-specification.md` to edit
3. I'll provide the exact code changes needed

The design system is fully customizable—you have complete control over every visual element.
