import { useTheme } from "@mui/material"
import { Box } from "@mui/system"
import * as Optuna from "@optuna/types"
import * as plotly from "plotly.js-dist-min"
import { FC, useEffect } from "react"
import { plotlyDarkTemplate } from "./PlotlyDarkMode"

const plotDomId = "graph-radar-chart"

export const PlotRadarChart: FC<{
  trial: Optuna.Trial
  bestTrials?: Optuna.Trial[]
  metricNames?: string[]
  colorTheme?: Partial<plotly.Template>
}> = ({ trial, bestTrials, metricNames, colorTheme }) => {
  const theme = useTheme()
  const colorThemeUsed =
    colorTheme ?? (theme.palette.mode === "dark" ? plotlyDarkTemplate : {})

  useEffect(() => {
    plotRadarChartItem(trial, colorThemeUsed, bestTrials, metricNames)
  }, [trial, metricNames, bestTrials, colorThemeUsed])

  return (
    <>
      <Box id={plotDomId} sx={{ height: "450px" }} />
    </>
  )
}

const plotRadarChartItem = (
  trial: Optuna.Trial,
  colorTheme: Partial<Plotly.Template>,
  bestTrials?: Optuna.Trial[],
  metricNames?: string[]
) => {
  if (document.getElementById(plotDomId) === null) {
    return
  }

  const values = trial.values
  const bestValues = bestTrials
    ?.map((t) => t.values)
    .filter((v): v is number[] => v !== undefined)
  if (values === undefined || bestValues === undefined) {
    return
  }

  let plotNames: string[] = []
  if (metricNames === undefined || metricNames.length !== values.length) {
    plotNames = values.map((_, i) => `value_${i.toString()}`)
  } else {
    plotNames = metricNames
  }

  const plotValues = normalizeMinMax(values, bestValues)
  const firstValue = plotValues[0]
  plotValues.push(firstValue)
  const firstName = plotNames[0]
  plotNames.push(firstName)

  const data: Partial<plotly.Data>[] = [
    {
      type: "scatterpolar",
      r: plotValues,
      theta: plotNames,
      mode: "lines+markers",
      name: `trial${trial.number.toString()}`,
      fill: "toself",
      hovertemplate: makeHovertext(trial),
    },
  ]

  const layout: Partial<plotly.Layout> = {
    polar: {
      radialaxis: {
        visible: true,
        range: [0, 1.2],
      },
    },
    title: "Normalized Values Radar Chart",
    template: colorTheme,
  }

  plotly.react(plotDomId, data, layout)
}

function normalizeMinMax(values: number[], bestValues: number[][]): number[] {
  const minValues = values.map((_, i) =>
    Math.min(...bestValues.map((v) => v[i]))
  )
  const maxValues = values.map((_, i) =>
    Math.max(...bestValues.map((v) => v[i]))
  )
  return values.map(
    (v, i) => (v - minValues[i]) / (maxValues[i] - minValues[i])
  )
}

const makeHovertext = (trial: Optuna.Trial): string => {
  return JSON.stringify(
    {
      number: trial.number,
      values: trial.values,
    },
    undefined,
    "  "
  ).replace(/\n/g, "<br>")
}
