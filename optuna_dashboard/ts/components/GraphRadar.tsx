import { Card, CardContent, useTheme } from "@mui/material"
import { PlotRadarChart } from "@optuna/react"
import * as Optuna from "@optuna/types"
import React, { FC } from "react"
import { usePlotlyColorTheme } from "../state"

export const GraphRadarChart: FC<{
  metricNames?: string[]
  trial: Optuna.Trial
  bestTrials?: Optuna.Trial[]
}> = ({ metricNames, trial, bestTrials }) => {
  const theme = useTheme()
  const colorTheme = usePlotlyColorTheme(theme.palette.mode)
  return (
    <Card sx={{ width: "450px" }}>
      <CardContent>
        <PlotRadarChart
          trial={trial}
          bestTrials={bestTrials}
          metricNames={metricNames}
          colorTheme={colorTheme}
        />
      </CardContent>
    </Card>
  )
}
