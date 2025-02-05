import * as React from 'react';

import { Shape } from '@visx/visx';
import { equals, negate } from 'ramda';

import { alpha, useTheme } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

import { useMemoComponent } from '@centreon/ui';

import { useTimeShiftContext, TimeShiftDirection } from '.';

export const timeShiftZoneWidth = 50;

const useStyles = makeStyles({
  translationZone: {
    cursor: 'pointer',
  },
});

interface Props {
  direction: TimeShiftDirection;
  directionHovered: TimeShiftDirection | null;
  onDirectionHover: (direction: TimeShiftDirection | null) => () => void;
}

const TimeShiftZone = ({
  direction,
  onDirectionHover,
  directionHovered,
}: Props): JSX.Element => {
  const theme = useTheme();
  const classes = useStyles();

  const { graphHeight, graphWidth, marginLeft, marginTop, shiftTime } =
    useTimeShiftContext();

  return useMemoComponent({
    Component: (
      <Shape.Bar
        className={classes.translationZone}
        fill={
          equals(directionHovered, direction)
            ? alpha(theme.palette.common.white, 0.5)
            : 'transparent'
        }
        height={graphHeight}
        width={timeShiftZoneWidth}
        x={
          (equals(direction, TimeShiftDirection.backward)
            ? negate(timeShiftZoneWidth)
            : graphWidth) + marginLeft
        }
        y={marginTop}
        onClick={(): void => shiftTime?.(direction)}
        onMouseLeave={onDirectionHover(null)}
        onMouseOver={onDirectionHover(direction)}
      />
    ),
    memoProps: [
      directionHovered,
      graphHeight,
      graphWidth,
      marginLeft,
      marginTop,
    ],
  });
};

export default TimeShiftZone;
