# Design System
### DataPure — Clean. Simple. Productive.

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&customColorList=12,20,26&height=8&section=header&width=100%" width="100%" />
</div>

This document defines the visual design system, UI components, design tokens, and user experience standards for the **DataPure** enterprise data deduplication and audit platform. The goal is to establish an elegant, modern, minimal interface with consistent styling across telemetry dashboards, ingestion forms, and queue review screens.

---

### 1. Design Principles

<p align="center" style="margin: 20px 0;">
  <img src="./principles.svg" alt="DataPure Design Principles" width="100%" />
</p>

---

### 2. Color Palette
*Primary colors used across the application, telemetry interfaces, and audit dashboards:*

<p align="center" style="margin: 20px 0;">
  <img src="./palette.svg" alt="DataPure Design System Color Palette" width="100%" />
</p>

---

### 3. Typography
*We use Inter as the primary interface font and JetBrains Mono for hashes, similarity scores, and code telemetry:*

<div style="background-color: #0D1117; border: 1px solid #30363D; border-radius: 8px; padding: 18px 20px; margin: 14px 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td width="90" align="center" style="font-size: 40px; font-weight: 800; background-color: #161B22; color: #818CF8; border: 1px solid #30363D; border-radius: 8px; padding: 8px 12px;">Aa</td>
      <td style="padding-left: 20px;">
        <div style="font-size: 18px; font-weight: 700; color: #F0F6FC;">Inter &amp; JetBrains Mono</div>
        <div style="color: #818CF8; font-size: 12px; font-weight: 600; margin-top: 2px;">Primary font family</div>
        <div style="color: #8B949E; font-size: 12px; margin-top: 4px;">Clean, modern, and highly legible across deduplication diffs, hash digests, and telemetry logs.</div>
      </td>
    </tr>
  </table>
</div>

| Role | Font Family | Size / Weight | Usage |
| :-- | :-- | :-- | :-- |
| **Heading 1** | Inter | 24px / 700 Bold | Page headers, main dashboard titles |
| **Heading 2** | Inter | 18px / 600 Semi-Bold | Section headers, card titles |
| **Body Regular** | Inter | 14px / 400 Regular | Paragraphs, documentation text, descriptions |
| **Data / Monospace** | JetBrains Mono | 12px / 500 Medium | SHA-256 hashes, similarity percentages, timestamps |

---

### 4. UI Components & Visual Tokens

#### 4.1 Deduplication Status Badges

| Status | Background | Text Color | Border | Meaning |
| :-- | :-- | :-- | :-- | :-- |
| **UNIQUE** | `#ECFDF5` | `#059669` | `1px solid #A7F3D0` | Non-duplicate record inserted into database |
| **FLAGGED** | `#FFFBEB` | `#D97706` | `1px solid #FDE68A` | Potential duplicate ($70\% \le \text{Score} < 85\%$) queued for review |
| **REDUNDANT** | `#FEF2F2` | `#DC2626` | `1px solid #FECACA` | Exact or high-confidence duplicate ($\ge 85\%$) rejected |

#### 4.2 Telemetry Summary Card

<div style="background-color: #0D1117; border: 1px solid #30363D; border-radius: 8px; padding: 18px 20px; margin: 14px 0;">
  <div style="display: flex; justify-content: space-between; align-items: center;">
    <div>
      <span style="font-size: 11px; font-weight: 600; color: #8B949E; text-transform: uppercase; letter-spacing: 0.05em;">Total Ingested Records</span>
      <div style="font-size: 26px; font-weight: 800; color: #F0F6FC; margin-top: 4px;">128,450</div>
    </div>
    <div style="text-align: right;">
      <span style="background-color: #064E3B; color: #34D399; border: 1px solid #059669; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">99.4% Redundancy Catch Rate</span>
      <div style="font-size: 12px; color: #8B949E; margin-top: 6px;">Avg Latency: <code style="color: #818CF8;">2.4ms</code></div>
    </div>
  </div>
</div>

