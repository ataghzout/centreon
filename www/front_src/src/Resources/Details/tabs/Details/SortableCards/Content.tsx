import * as React from 'react';

import { isNil } from 'ramda';
import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';

import { makeStyles, Theme, Grid, GridSize, Paper } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { CreateCSSProperties } from '@material-ui/styles';

import DetailsCard from '../DetailsCard';

import { CardsLayout } from './models';

const useStyles = makeStyles<Theme, { isDragging: boolean }>((theme) => ({
  handler: ({ isDragging }): CreateCSSProperties => ({
    alignItems: 'center',
    cursor: isDragging ? 'grabbing' : 'grab',
    display: 'flex',
    height: '100%',
  }),
  tile: {
    '&:hover': {
      boxShadow: theme.shadows[3],
    },
    display: 'grid',
    gridTemplateColumns: 'min-content auto',
  },
}));

interface ContentProps extends CardsLayout {
  attributes;
  isDragging: boolean;
  itemRef: React.RefObject<HTMLDivElement>;
  listeners: DraggableSyntheticListeners;
  style;
}

const Content = ({
  listeners,
  isDragging,
  attributes,
  style,
  itemRef,
  title,
  line,
  active,
  xs,
  isCustomCard,
  width,
}: ContentProps): JSX.Element => {
  const { t } = useTranslation();
  const classes = useStyles({ isDragging });

  const getVariableXs = (): GridSize => {
    const variableXs = isNil(xs) ? 6 : xs;

    return (width > 950 ? variableXs / 2 : variableXs) as GridSize;
  };

  return (
    <Grid
      item
      key={title}
      xs={getVariableXs()}
      {...attributes}
      ref={itemRef}
      style={style}
    >
      <Paper>
        <div className={classes.tile}>
          <div {...listeners} className={classes.handler}>
            <MoreVertIcon fontSize="small" />
          </div>
          <DetailsCard
            active={active}
            isCustomCard={isCustomCard}
            line={line}
            title={t(title)}
          />
        </div>
      </Paper>
    </Grid>
  );
};

export default Content;