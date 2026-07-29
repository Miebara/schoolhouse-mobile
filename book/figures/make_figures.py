#!/usr/bin/env python3
"""Figure set for Broken Wings. Print-oriented, white surface, one accent hue.

Palette is the validated reference instance restricted to what a book page
needs: emphasis (accent + de-emphasis gray) and a validated 3-step ordinal
blue ramp. No categorical rainbow anywhere.
"""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, FancyArrowPatch, Rectangle, Circle
from matplotlib.lines import Line2D

OUT = "/home/user/schoolhouse-mobile/book/figures"
os.makedirs(OUT, exist_ok=True)

SURFACE = "#ffffff"
INK = "#0b0b0b"
INK2 = "#52514e"
MUTED = "#898781"
GRID = "#e1e0d9"
BASE = "#c3c2b7"
ACCENT = "#2a78d6"        # categorical slot 1
ACCENT2 = "#eb6834"       # categorical slot 2 (validated all-pairs with slot 1)
DEEMPH = "#d8d7d1"        # de-emphasis gray
RAMP = ["#86b6ef", "#2a78d6", "#104281"]   # validated ordinal ramp

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 8.5,
    "figure.facecolor": SURFACE,
    "axes.facecolor": SURFACE,
    "savefig.facecolor": SURFACE,
    "axes.edgecolor": BASE,
    "axes.labelcolor": INK2,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "text.color": INK,
    "axes.linewidth": 0.8,
})


def finish(fig, name):
    path = f"{OUT}/{name}.png"
    fig.savefig(path, dpi=200, bbox_inches="tight", pad_inches=0.12)
    plt.close(fig)
    print("wrote", path)


def bare(ax, yleft=True):
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    if not yleft:
        ax.spines["left"].set_visible(False)
    ax.tick_params(length=0)


# ---------------------------------------------------------------- figure 1
def fig_toll():
    """Deaths per mass-casualty event. Horizontal, because the names are long."""
    events = [
        ("1969  Nigeria Airways VC10, Lagos", 87, 0),
        ("1973  Pilgrimage charter, Kano", 176, 0),
        ("1991  Flight 2120, Jeddah", 261, 0),
        ("1992  Air Force C-130, Ejigbo", 158, 0),
        ("1996  ADC 086, Lagos lagoon", 144, 0),
        ("2002  EAS 4226, Kano", 148, 0),
        ("2005  Bellview 210, Lisa", 117, 0),
        ("2005  Sosoliso 1145, Port Harcourt", 108, 0),
        ("2006  ADC 053, Abuja", 96, 0),
        ("2012  Dana 992, Iju Ishaga", 153, 1),
        ("2013  Associated charter, Lagos", 15, 1),
        ("2021  Air Force Beechcraft, Abuja", 7, 1),
        ("2021  Air Force Beechcraft, Kaduna", 11, 1),
    ]
    names = [e[0] for e in events]
    vals = [e[1] for e in events]
    after = [e[2] for e in events]
    ypos = list(range(len(events)))[::-1]

    fig, ax = plt.subplots(figsize=(6.4, 4.3))
    ax.barh(ypos, vals, height=0.62,
            color=[DEEMPH if a else ACCENT for a in after],
            edgecolor=SURFACE, linewidth=1.2, zorder=3)
    for y, v in zip(ypos, vals):
        ax.text(v + 5, y, str(v), fontsize=7.8, color=INK, va="center")

    ax.set_yticks(ypos)
    ax.set_yticklabels(names, fontsize=7.6, color=INK2)
    ax.set_xlim(0, 300)
    ax.set_xticks([0, 100, 200, 300])
    ax.set_xlabel("Dead")
    ax.xaxis.grid(True, color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)

    # divider between the last pre-Act row and the first post-Act row
    split = ypos[events.index(("2006  ADC 053, Abuja", 96, 0))] - 0.5
    ax.axhline(split, color=INK2, linewidth=1.0, linestyle=(0, (3, 2)),
               zorder=5, xmin=0.0, xmax=1.0)
    ax.text(298, split - 0.22, "Civil Aviation Act 2006", fontsize=7.6,
            color=INK, ha="right", va="top")

    bare(ax, yleft=False)
    ax.set_ylim(-0.8, len(events) - 0.2)
    ax.set_title("Mass-casualty aviation deaths in Nigeria, 1969 to 2021",
                 fontsize=9.5, color=INK, loc="left", pad=10)
    finish(fig, "fig-01-toll")


# ---------------------------------------------------------------- figure 2
def fig_cumulative():
    """Cumulative deaths as a step curve. The point is where it flattens."""
    pts = [(1969, 87), (1973, 176), (1991, 261), (1992, 158), (1996, 144),
           (2002, 148), (2005.0, 117), (2005.6, 108), (2006, 96),
           (2012, 153), (2013, 15), (2021.1, 7), (2021.5, 11)]
    xs, ys, run = [1965], [0], 0
    for x, d in pts:
        run += d
        xs += [x, x]
        ys += [ys[-1], run]
    xs.append(2026)
    ys.append(run)

    fig, ax = plt.subplots(figsize=(6.4, 3.3))
    ax.plot(xs, ys, color=ACCENT, linewidth=1.8, solid_joinstyle="round", zorder=3)
    ax.axvline(2006.6, color=INK2, linewidth=1.0, linestyle=(0, (3, 2)), zorder=2)

    ax.annotate("Act of 2006", xy=(2006.6, 1300), xytext=(1988, 1560),
                fontsize=8, color=INK,
                arrowprops=dict(arrowstyle="-", color=MUTED, linewidth=0.8))
    ax.text(2013.5, 1620, "One catastrophe in\nthe seventeen years since",
            fontsize=8, color=INK2, va="center", linespacing=1.35)
    ax.text(1975, 700, "Seven catastrophes\nin fifteen years", fontsize=8,
            color=INK2, va="center", linespacing=1.35)

    ax.set_xlim(1965, 2026)
    ax.set_ylim(0, 1900)
    ax.set_yticks([0, 500, 1000, 1500])
    ax.set_ylabel("Cumulative dead")
    ax.yaxis.grid(True, color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    bare(ax)
    ax.set_title("The curve that stopped climbing", fontsize=9.5, color=INK,
                 loc="left", pad=10)
    finish(fig, "fig-02-cumulative")


# ---------------------------------------------------------------- figure 3
def fig_coverage():
    """Arithmetic, not data. Coverage decays as traffic outgrows headcount."""
    years = list(range(0, 11))
    fig, ax = plt.subplots(figsize=(6.4, 3.3))
    for (g, colour) in zip([0.03, 0.05, 0.07], RAMP):
        cov = [100 / ((1 + g) ** y) for y in years]
        ax.plot(years, cov, color=colour, linewidth=1.8, zorder=3)
        ax.plot([years[-1]], [cov[-1]], "o", color=colour, markersize=5,
                markeredgecolor=SURFACE, markeredgewidth=1.2, zorder=4)
        ax.text(10.25, cov[-1], f"  traffic +{int(g*100)}% a year\n  coverage {cov[-1]:.0f}%",
                fontsize=7.6, color=INK2, va="center", linespacing=1.4)

    ax.set_xlim(0, 10)
    ax.set_ylim(45, 102)
    ax.set_xticks(years)
    ax.set_yticks([50, 60, 70, 80, 90, 100])
    ax.set_xlabel("Years with the inspectorate held flat")
    ax.set_ylabel("Effective coverage, percent")
    ax.yaxis.grid(True, color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    bare(ax)
    ax.set_title("What growth does to a plateau", fontsize=9.5, color=INK,
                 loc="left", pad=10)
    fig.subplots_adjust(right=0.74)
    finish(fig, "fig-03-coverage")


# ---------------------------------------------------------------- figure 4
def fig_chain():
    """Seven stages at eighty percent each. Product, not sum."""
    stages = ["Detection", "Dispatch", "Access", "Extrication",
              "Stabilization", "Transport", "Definitive\ncare"]
    vals, run = [], 100.0
    for _ in stages:
        run *= 0.8
        vals.append(run)

    fig, ax = plt.subplots(figsize=(6.4, 3.2))
    ax.bar(range(len(stages)), vals, width=0.62, color=ACCENT,
           edgecolor=SURFACE, linewidth=1.2, zorder=3)
    ax.axhline(80, color=INK2, linewidth=1.0, linestyle=(0, (3, 2)), zorder=4)
    ax.text(6.45, 82, "what each\nstage scores", fontsize=7.6, color=INK2,
            ha="right", va="bottom", linespacing=1.35)

    for i, v in enumerate(vals):
        ax.text(i, v + 2.2, f"{v:.0f}", fontsize=8, color=INK, ha="center")

    ax.set_xticks(range(len(stages)))
    ax.set_xticklabels(stages, fontsize=7.4, color=INK2, linespacing=1.3)
    ax.set_ylim(0, 100)
    ax.set_yticks([0, 25, 50, 75, 100])
    ax.set_ylabel("Survivors still reachable, percent")
    ax.yaxis.grid(True, color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    bare(ax)
    ax.set_title("Seven stages at eighty percent each leaves twenty one",
                 fontsize=9.5, color=INK, loc="left", pad=10)
    finish(fig, "fig-04-chain")


# ---------------------------------------------------------------- figure 5
def fig_microburst():
    """Schematic. Geometry above, the airspeed trap below."""
    fig, (a1, a2) = plt.subplots(2, 1, figsize=(6.4, 4.2),
                                 gridspec_kw={"height_ratios": [1.15, 1],
                                              "hspace": 0.42})
    # cloud
    for cx, cy, r in [(5.0, 8.4, 1.15), (6.1, 8.6, 0.95), (3.9, 8.6, 0.95),
                      (4.5, 8.9, 0.8), (5.6, 8.9, 0.8)]:
        a1.add_patch(Circle((cx, cy), r, facecolor="#eceae4",
                            edgecolor=BASE, linewidth=0.8, zorder=1))
    # downdraft
    for dx in (4.5, 5.0, 5.5):
        a1.add_patch(FancyArrowPatch((dx, 7.6), (dx, 3.4),
                                     arrowstyle="-|>", mutation_scale=9,
                                     color=ACCENT, linewidth=1.4, zorder=3))
    # outflow
    a1.add_patch(FancyArrowPatch((4.4, 3.1), (2.4, 3.1), arrowstyle="-|>",
                                 mutation_scale=9, color=ACCENT, linewidth=1.4))
    a1.add_patch(FancyArrowPatch((5.6, 3.1), (7.6, 3.1), arrowstyle="-|>",
                                 mutation_scale=9, color=ACCENT, linewidth=1.4))
    # flight path
    a1.plot([0.5, 3.0, 5.0, 6.6, 7.6], [3.9, 5.0, 4.5, 2.6, 1.2],
            color=INK, linewidth=1.8, zorder=4)
    a1.plot([0.5], [3.9], marker=(3, 0, -60), markersize=9, color=INK, zorder=5)
    a1.axhline(0.8, color=BASE, linewidth=1.2)
    a1.text(0.5, 0.25, "ground", fontsize=7.4, color=MUTED)

    a1.text(2.0, 5.5, "1  headwind\n    airspeed rises", fontsize=7.6,
            color=INK2, linespacing=1.4)
    a1.text(5.0, 2.55, "2  downdraft", fontsize=7.6, color=INK2,
            ha="center", va="top")
    a1.text(6.15, 3.9, "3  tailwind\n    airspeed collapses", fontsize=7.6,
            color=INK2, linespacing=1.4)
    a1.set_xlim(0, 10.2)
    a1.set_ylim(0, 10)
    a1.axis("off")
    a1.set_title("The microburst trap", fontsize=9.5, color=INK, loc="left")

    # airspeed trace
    x = [0, 1.2, 2.4, 3.4, 4.4, 5.4, 6.4, 7.4, 8.4]
    v = [100, 104, 112, 116, 108, 88, 72, 64, 60]
    a2.plot(x, v, color=ACCENT, linewidth=1.8, zorder=3)
    a2.axhline(100, color=BASE, linewidth=1.0, linestyle=(0, (3, 2)), zorder=2)
    a2.text(0.15, 107, "target speed", fontsize=7.4, color=MUTED,
            va="bottom")
    a2.annotate("the bait", xy=(3.4, 116), xytext=(2.0, 124), fontsize=7.6,
                color=INK2,
                arrowprops=dict(arrowstyle="-", color=MUTED, linewidth=0.8))
    a2.annotate("nothing left to trade", xy=(7.4, 64), xytext=(5.0, 52),
                fontsize=7.6, color=INK2,
                arrowprops=dict(arrowstyle="-", color=MUTED, linewidth=0.8))
    a2.set_xlim(0, 10.2)
    a2.set_ylim(40, 136)
    a2.set_xticks([])
    a2.set_yticks([])
    a2.set_ylabel("Airspeed", color=INK2)
    a2.set_xlabel("Seconds, tens of them", color=INK2)
    for s in ("top", "right"):
        a2.spines[s].set_visible(False)
    finish(fig, "fig-05-microburst")


# ---------------------------------------------------------------- figure 6
def fig_pyramid():
    """Where airworthiness actually lives."""
    fig, ax = plt.subplots(figsize=(6.4, 3.6))
    tiers = [
        (0.0, 1.02, 9.6, 7.2, "Daily and transit checks",
         "hours of labour, every day", RAMP[0], INK, INK2),
        (1.02, 2.04, 7.2, 4.8, "Lettered checks",
         "overnight, every few weeks", RAMP[1], SURFACE, SURFACE),
        (2.04, 3.06, 4.8, 2.4, "Heavy checks",
         "weeks off the line", RAMP[2], SURFACE, SURFACE),
    ]
    for y0, y1, wb, wt, name, note, colour, c1, c2 in tiers:
        pts = [(5 - wb / 2, y0 + 0.05), (5 + wb / 2, y0 + 0.05),
               (5 + wt / 2, y1 - 0.05), (5 - wt / 2, y1 - 0.05)]
        ax.add_patch(Polygon(pts, closed=True, facecolor=colour,
                             edgecolor=SURFACE, linewidth=1.6, zorder=3))
        ax.text(5, (y0 + y1) / 2 + 0.14, name, fontsize=8.6, color=c1,
                ha="center", va="center", weight="bold", zorder=4)
        ax.text(5, (y0 + y1) / 2 - 0.22, note, fontsize=7.3, color=c2,
                ha="center", va="center", zorder=4)

    ax.annotate("airworthiness\nlives here", xy=(6.0, 2.62), xytext=(8.4, 3.15),
                fontsize=8, color=INK, ha="center", va="center",
                linespacing=1.35,
                arrowprops=dict(arrowstyle="-|>", color=INK2, linewidth=0.9,
                                mutation_scale=9))
    ax.text(0.0, -0.55,
            "Deferring the top tier does not skip a formality. It spends the margin\n"
            "the engineers reserved for the inspection that misses something.",
            fontsize=7.6, color=INK2, linespacing=1.5, va="top")
    ax.set_xlim(-0.2, 10.2)
    ax.set_ylim(-1.5, 3.5)
    ax.axis("off")
    ax.set_title("The maintenance pyramid", fontsize=9.5, color=INK,
                 loc="left", pad=6)
    finish(fig, "fig-06-pyramid")


# ---------------------------------------------------------------- figure 7
def fig_triangle():
    """Three states, three corners, nobody in the middle."""
    fig, ax = plt.subplots(figsize=(6.0, 3.9))
    pts = [(5.0, 8.4), (1.4, 1.6), (8.6, 1.6)]
    ax.add_patch(Polygon(pts, closed=True, facecolor="#f4f3ef",
                         edgecolor=BASE, linewidth=1.2, zorder=1))
    labels = [
        (5.0, 8.9, "CANADA", "held the operating certificate", "center", 1),
        (1.2, 1.0, "SAUDI ARABIA", "held the runway", "center", 0),
        (8.8, 1.0, "NIGERIA", "held the passengers,\nthe brand, the contract",
         "center", 0),
    ]
    for x, y, head, note, ha, top in labels:
        ax.plot([x], [8.4 if top else 1.6], "o", color=ACCENT, markersize=8,
                markeredgecolor=SURFACE, markeredgewidth=1.4, zorder=4)
        if top:
            ax.text(x, y + 0.62, head, fontsize=8.4, color=INK, ha=ha,
                    va="bottom", weight="bold")
            ax.text(x, y + 0.48, note, fontsize=7.4, color=INK2, ha=ha,
                    va="top", linespacing=1.4)
        else:
            ax.text(x, y, head, fontsize=8.4, color=INK, ha=ha, va="top",
                    weight="bold")
            ax.text(x, y - 0.42, note, fontsize=7.4, color=INK2, ha=ha,
                    va="top", linespacing=1.4)

    ax.text(5.0, 4.4, "261 people", fontsize=11.5, color=INK, ha="center",
            weight="bold")
    ax.text(5.0, 3.7, "sovereign to nobody", fontsize=8, color=INK2,
            ha="center")
    ax.set_xlim(0, 10)
    ax.set_ylim(-0.6, 10.4)
    ax.axis("off")
    ax.set_title("The accountability triangle, Flight 2120",
                 fontsize=9.5, color=INK, loc="left")
    finish(fig, "fig-07-triangle")


# ---------------------------------------------------------------- figure 8
def fig_sorting():
    """How the world's old aircraft found Kano."""
    fig, ax = plt.subplots(figsize=(6.4, 3.4))
    stops = [
        (1.1, "0 yr", "Flagship fleet", "own hangars, full programme"),
        (3.3, "12 yr", "Charter operator", "maintenance outsourced"),
        (5.5, "20 yr", "Second and third tier", "records change custody"),
        (7.7, "25 yr", "Naira earner in Lagos", "worth less than one engine"),
    ]
    ys = [3.4, 2.7, 2.0, 1.3]
    for (x, age, name, note), y in zip(stops, ys):
        ax.plot([x], [y], "o", color=ACCENT, markersize=8,
                markeredgecolor=SURFACE, markeredgewidth=1.4, zorder=4)
        ax.text(x + 0.28, y + 0.13, name, fontsize=8.2, color=INK, va="bottom")
        ax.text(x + 0.28, y - 0.12, note, fontsize=7.3, color=INK2, va="top")
        ax.text(x - 0.22, y, age, fontsize=7.3, color=MUTED, ha="right",
                va="center")

    for i in range(3):
        ax.add_patch(FancyArrowPatch((stops[i][0] + 0.16, ys[i] - 0.08),
                                     (stops[i + 1][0] - 0.16, ys[i + 1] + 0.08),
                                     arrowstyle="-|>", mutation_scale=9,
                                     color=BASE, linewidth=1.2, zorder=2))

    ax.text(0.0, 0.35,
            "Price falls with age. So does the capacity of each new owner to keep\n"
            "the promise. The market sorts the asset to whoever will spend least on it.",
            fontsize=7.6, color=INK2, linespacing=1.45)
    ax.set_xlim(0, 10.6)
    ax.set_ylim(0, 4.3)
    ax.axis("off")
    ax.set_title("The sorting machine", fontsize=9.5, color=INK, loc="left")
    finish(fig, "fig-08-sorting")


# ---------------------------------------------------------------- figure 9
def fig_successors():
    """Four attempts at a flag carrier, and one unpaid debt."""
    fig, ax = plt.subplots(figsize=(6.4, 3.5))
    rows = [
        (1958, 2003, "Nigeria Airways", ACCENT, 4.6),
        (2001, 2003, "Nigeria Global  (announced, never flew)", DEEMPH, 3.6),
        (2005, 2012, "Virgin Nigeria, then Air Nigeria", ACCENT, 2.8),
        (2010, 2016, "Paper carriers  (never reached a runway)", DEEMPH, 2.0),
        (2016, 2023, "Nigeria Air  (suspended)", DEEMPH, 1.2),
    ]
    for x0, x1, name, colour, y in rows:
        ax.add_patch(Rectangle((x0, y - 0.19), x1 - x0, 0.38, facecolor=colour,
                               edgecolor=SURFACE, linewidth=1.2, zorder=3))
        ax.text(x1 + 0.8, y, name, fontsize=7.9, color=INK, va="center")

    # the unpaid gap
    ax.add_patch(Rectangle((2004, 0.15), 14, 0.30, facecolor=ACCENT2,
                           edgecolor=SURFACE, linewidth=1.2, zorder=3))
    ax.text(2018.8, 0.30, "Severance owed to about five thousand\n"
                          "former staff, unpaid for fourteen years",
            fontsize=7.6, color=INK, va="center", linespacing=1.4)

    ax.set_xlim(1955, 2044)
    ax.set_ylim(-0.35, 5.4)
    ax.set_xticks([1960, 1980, 2000, 2020])
    ax.set_yticks([])
    ax.xaxis.grid(True, color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    ax.tick_params(length=0)
    ax.set_title("Four attempts at a flag carrier, and one unsettled debt",
                 fontsize=9.5, color=INK, loc="left", pad=10)
    finish(fig, "fig-09-successors")


for f in (fig_toll, fig_cumulative, fig_coverage, fig_chain, fig_microburst,
          fig_pyramid, fig_triangle, fig_sorting, fig_successors):
    f()
print("done")
