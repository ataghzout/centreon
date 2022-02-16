/* eslint-disable @typescript-eslint/naming-convention */
import React from 'react';

import classnames from 'classnames';
import * as yup from 'yup';
import numeral from 'numeral';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation, withTranslation } from 'react-i18next';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';

import HostIcon from '@mui/icons-material/Dns';

import {
  IconHeader,
  IconToggleSubmenu,
  SubmenuHeader,
  SubmenuItem,
  SubmenuItems,
  SeverityCode,
  StatusCounter,
  SelectEntry,
} from '@centreon/ui';
import { userAtom } from '@centreon/ui-context';

import { Criteria } from '../../../Resources/Filter/Criterias/models';
import { applyFilterDerivedAtom } from '../../../Resources/Filter/filterAtoms';
import styles from '../../header.scss';
import {
  getHostResourcesUrl,
  downCriterias,
  unreachableCriterias,
  upCriterias,
  pendingCriterias,
  unhandledStateCriterias,
  hostCriterias,
} from '../getResourcesUrl';
import RessourceStatusCounter, { useStyles } from '..';
import getDefaultCriterias from '../../../Resources/Filter/Criterias/default';

const hostStatusEndpoint =
  'internal.php?object=centreon_topcounter&action=hosts_status';

const numberFormat = yup.number().required().integer();

const statusSchema = yup.object().shape({
  down: yup.object().shape({
    total: numberFormat,
    unhandled: numberFormat,
  }),
  ok: numberFormat,
  pending: numberFormat,
  refreshTime: numberFormat,
  total: numberFormat,
  unreachable: yup.object().shape({
    total: numberFormat,
    unhandled: numberFormat,
  }),
});

interface HostData {
  down: {
    total: number;
    unhandled: number;
  };
  ok: number;
  pending: number;
  total: number;
  unandled: number;
  unreachable: {
    total: number;
    unhandled: number;
  };
}

interface SelectResourceProps {
  criterias: Array<Criteria>;
  link: string;
  toggle?: () => void;
}

const HostStatusCounter = (): JSX.Element => {
  const classes = useStyles();
  const navigate = useNavigate();

  const { t } = useTranslation();

  const { use_deprecated_pages } = useAtomValue(userAtom);
  const applyFilter = useUpdateAtom(applyFilterDerivedAtom);

  const unhandledDownHostsCriterias = getDefaultCriterias({
    resourceTypes: hostCriterias.value,
    states: unhandledStateCriterias.value,
    statuses: downCriterias.value as Array<SelectEntry>,
  });
  const unhandledDownHostsLink = use_deprecated_pages
    ? '/main.php?p=20202&o=h_down&search='
    : getHostResourcesUrl({
        stateCriterias: unhandledStateCriterias,
        statusCriterias: downCriterias,
      });

  const unhandledUnreachableHostsCriterias = getDefaultCriterias({
    resourceTypes: hostCriterias.value,
    states: unhandledStateCriterias.value,
    statuses: unreachableCriterias.value as Array<SelectEntry>,
  });
  const unhandledUnreachableHostsLink = use_deprecated_pages
    ? '/main.php?p=20202&o=h_unreachable&search='
    : getHostResourcesUrl({
        stateCriterias: unhandledStateCriterias,
        statusCriterias: unreachableCriterias,
      });

  const upHostsCriterias = getDefaultCriterias({
    resourceTypes: hostCriterias.value,
    statuses: upCriterias.value as Array<SelectEntry>,
  });
  const upHostsLink = use_deprecated_pages
    ? '/main.php?p=20202&o=h_up&search='
    : getHostResourcesUrl({
        statusCriterias: upCriterias,
      });

  const hostsCriterias = getDefaultCriterias({
    resourceTypes: hostCriterias.value,
  });
  const hostsLink = use_deprecated_pages
    ? '/main.php?p=20202&o=h&search='
    : getHostResourcesUrl();

  const pendingHostsCriterias = getDefaultCriterias({
    resourceTypes: hostCriterias.value,
    statuses: pendingCriterias.value as Array<SelectEntry>,
  });
  const pendingHostsLink = use_deprecated_pages
    ? '/main.php?p=20202&o=h_pending&search='
    : getHostResourcesUrl({
        statusCriterias: pendingCriterias,
      });

  const changeFilterAndNavigate =
    ({ link, criterias, toggle }: SelectResourceProps) =>
    (e): void => {
      e.preventDefault();
      toggle?.();
      if (!use_deprecated_pages) {
        applyFilter({ criterias, id: '', name: 'New Filter' });
      }
      navigate(link);
    };

  return (
    <RessourceStatusCounter<HostData>
      endpoint={hostStatusEndpoint}
      loaderWidth={27}
      schema={statusSchema}
    >
      {({ hasPending, toggled, toggleDetailedView, data }): JSX.Element => (
        <div className={`${styles.wrapper} wrap-right-hosts`}>
          <SubmenuHeader active={toggled}>
            <IconHeader
              Icon={HostIcon}
              iconName={t('Hosts')}
              pending={hasPending}
              onClick={toggleDetailedView}
            />
            <Link
              className={classnames(classes.link, styles['wrap-middle-icon'])}
              data-testid="Hosts Down"
              to={unhandledDownHostsLink}
              onClick={changeFilterAndNavigate({
                criterias: unhandledDownHostsCriterias,
                link: unhandledDownHostsLink,
              })}
            >
              <StatusCounter
                count={data.down.unhandled}
                severityCode={SeverityCode.High}
              />
            </Link>
            <Link
              className={classnames(classes.link, styles['wrap-middle-icon'])}
              data-testid="Hosts Unreachable"
              to={unhandledUnreachableHostsLink}
              onClick={changeFilterAndNavigate({
                criterias: unhandledUnreachableHostsCriterias,
                link: unhandledUnreachableHostsLink,
              })}
            >
              <StatusCounter
                count={data.unreachable.unhandled}
                severityCode={SeverityCode.Low}
              />
            </Link>
            <Link
              className={classnames(classes.link, styles['wrap-middle-icon'])}
              data-testid="Hosts Up"
              to={upHostsLink}
              onClick={changeFilterAndNavigate({
                criterias: upHostsCriterias,
                link: upHostsLink,
              })}
            >
              <StatusCounter count={data.ok} severityCode={SeverityCode.Ok} />
            </Link>
            <IconToggleSubmenu
              data-testid="submenu-hosts"
              iconType="arrow"
              rotate={toggled}
              onClick={toggleDetailedView}
            />
            <div
              className={classnames(styles['submenu-toggle'], {
                [styles['submenu-toggle-active'] as string]: toggled,
              })}
            >
              <SubmenuItems>
                <Link
                  className={classes.link}
                  to={hostsLink}
                  onClick={changeFilterAndNavigate({
                    criterias: hostsCriterias,
                    link: hostsLink,
                    toggle: toggleDetailedView,
                  })}
                >
                  <SubmenuItem
                    submenuCount={numeral(data.total).format()}
                    submenuTitle={t('All')}
                    testIdCount="submenu count All"
                    testIdTitle="submenu title All"
                  />
                </Link>
                <Link
                  className={classes.link}
                  to={unhandledDownHostsLink}
                  onClick={changeFilterAndNavigate({
                    criterias: unhandledDownHostsCriterias,
                    link: unhandledDownHostsLink,
                    toggle: toggleDetailedView,
                  })}
                >
                  <SubmenuItem
                    dotColored="red"
                    submenuCount={`${numeral(data.down.unhandled).format(
                      '0a',
                    )}/${numeral(data.down.total).format('0a')}`}
                    submenuTitle={t('Down')}
                    testIdCount="submenu count Down"
                    testIdTitle="submenu title Down"
                  />
                </Link>
                <Link
                  className={classes.link}
                  to={unhandledUnreachableHostsLink}
                  onClick={changeFilterAndNavigate({
                    criterias: unhandledUnreachableHostsCriterias,
                    link: unhandledUnreachableHostsLink,
                    toggle: toggleDetailedView,
                  })}
                >
                  <SubmenuItem
                    dotColored="gray"
                    submenuCount={`${numeral(data.unreachable.unhandled).format(
                      '0a',
                    )}/${numeral(data.unreachable.total).format('0a')}`}
                    submenuTitle={t('Unreachable')}
                    testIdCount="submenu count unreachable"
                    testIdTitle="submenu title unreachable"
                  />
                </Link>
                <Link
                  className={classes.link}
                  to={upHostsLink}
                  onClick={changeFilterAndNavigate({
                    criterias: upHostsCriterias,
                    link: upHostsLink,
                    toggle: toggleDetailedView,
                  })}
                >
                  <SubmenuItem
                    dotColored="green"
                    submenuCount={numeral(data.ok).format()}
                    submenuTitle={t('Up')}
                    testIdCount="submenu count ok"
                    testIdTitle="submenu title ok"
                  />
                </Link>
                <Link
                  className={classes.link}
                  to={pendingHostsLink}
                  onClick={changeFilterAndNavigate({
                    criterias: pendingHostsCriterias,
                    link: pendingHostsLink,
                    toggle: toggleDetailedView,
                  })}
                >
                  <SubmenuItem
                    dotColored="blue"
                    submenuCount={numeral(data.pending).format()}
                    submenuTitle={t('Pending')}
                    testIdCount="submenu count pending"
                    testIdTitle="submenu title pending"
                  />
                </Link>
              </SubmenuItems>
            </div>
          </SubmenuHeader>
        </div>
      )}
    </RessourceStatusCounter>
  );
};

export default withTranslation()(HostStatusCounter);
