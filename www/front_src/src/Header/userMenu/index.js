/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-return-assign */
/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */

import React, { Component } from 'react';

import classnames from 'classnames';
import { withTranslation, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useUpdateAtom } from 'jotai/utils';

import { Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import UserIcon from '@mui/icons-material/AccountCircle';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import CheckIcon from '@mui/icons-material/Check';

import { postData, useRequest, getData, useSnackbar } from '@centreon/ui';

import styles from '../header.scss';
import Clock from '../Clock';
import MenuLoader from '../../components/MenuLoader';
import useNavigation from '../../Navigation/useNavigation';
import { areUserParametersLoadedAtom } from '../../Main/useUser';
import { logoutEndpoint } from '../../api/endpoint';
import reactRoutes from '../../reactRoutes/routeMap';

import { userEndpoint } from './api/endpoint';
import { labelProfile, labelYouHaveBeenLoggedOut } from './translatedLabels';

const EDIT_PROFILE_TOPOLOGY_PAGE = '50104';

const MuiStyles = createStyles({
  fullname: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    width: '115px',
  },
  nameAliasContainer: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
  },
});

class UserMenuContent extends Component {
  refreshTimeout = null;

  state = {
    copied: false,
    data: null,
    toggled: false,
  };

  componentDidMount() {
    window.addEventListener('mousedown', this.handleClick, false);
    this.getData();
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handleClick, false);
    clearTimeout(this.refreshTimeout);
  }

  // fetch api to get user data
  getData = () => {
    this.props
      .getUser()
      .then((data) => {
        this.setState(
          {
            data,
          },
          this.refreshData,
        );
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          this.setState({
            data: null,
          });
        }
      });
  };

  // refresh user data every minutes
  // @todo get this interval from backend
  refreshData = () => {
    clearTimeout(this.refreshTimeout);
    this.refreshTimeout = setTimeout(() => {
      this.getData();
    }, 60000);
  };

  toggle = () => {
    const { toggled } = this.state;
    this.setState({
      toggled: !toggled,
    });
  };

  // copy for autologin link
  onCopy = () => {
    this.autologinNode.select();
    window.document.execCommand('copy');
    this.setState({
      copied: true,
    });
  };

  handleClick = (e) => {
    if (!this.profile || this.profile.contains(e.target)) {
      return;
    }
    this.setState({
      toggled: false,
    });
  };

  render() {
    const { data, toggled, copied } = this.state;

    if (!data) {
      return <MenuLoader width={21} />;
    }

    // check if edit profile page (My Account) is allowed
    const { allowedPages, t, classes, logout } = this.props;
    const allowEditProfile = allowedPages?.includes(EDIT_PROFILE_TOPOLOGY_PAGE);

    const { fullname, username, autologinkey } = data;

    // creating autologin link, getting href, testing if there is a parameter, then generating link : if '?' then &autologin(etc.)
    const gethref = window.location.href;
    const conditionnedhref = gethref + (window.location.search ? '&' : '?');
    const autolink = `${conditionnedhref}autologin=1&useralias=${username}&token=${autologinkey}`;

    return (
      <div
        className={classnames(styles['wrap-right-user'], {
          [styles['submenu-active']]: toggled,
        })}
      >
        <Clock />
        <div ref={(profile) => (this.profile = profile)}>
          <UserIcon
            aria-label={t(labelProfile)}
            fontSize="large"
            style={{ color: '#FFFFFF', cursor: 'pointer', marginLeft: 8 }}
            onClick={this.toggle}
          />
          <div className={classnames(styles.submenu, styles.profile)}>
            <div className={styles['submenu-inner']}>
              <ul
                className={classnames(
                  styles['submenu-items'],
                  styles['list-unstyled'],
                )}
              >
                <li className={styles['submenu-item']}>
                  <div
                    className={classnames(
                      styles['submenu-item-link'],
                      classes.nameAliasContainer,
                    )}
                  >
                    <div>
                      <Typography className={classes.fullname} variant="body2">
                        {fullname}
                      </Typography>
                      <Typography
                        style={{ wordWrap: 'break-word' }}
                        variant="body2"
                      >
                        {t('as')}
                        {` ${username}`}
                      </Typography>
                    </div>
                    {allowEditProfile && (
                      <Link
                        className={styles['submenu-user-edit']}
                        to={`/main.php?p=${EDIT_PROFILE_TOPOLOGY_PAGE}&o=c`}
                        onClick={this.toggle}
                      >
                        <Typography variant="body2">
                          {t('Edit profile')}
                        </Typography>
                      </Link>
                    )}
                  </div>
                </li>
                {autologinkey && (
                  <div className={styles['submenu-content']}>
                    <button
                      className={styles['submenu-user-button']}
                      onClick={this.onCopy}
                    >
                      {t('Copy autologin link')}

                      {copied ? <CheckIcon /> : <FileCopyIcon />}
                    </button>
                    <textarea
                      readOnly
                      className={styles['hidden-input']}
                      id="autologin-input"
                      ref={(node) => (this.autologinNode = node)}
                      value={autolink}
                    />
                  </div>
                )}
              </ul>
              <div className={styles['submenu-content']}>
                <Link
                  className={styles.logoutLink}
                  to="/index.php"
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                  }}
                >
                  <button
                    className={classnames(
                      styles.btn,
                      styles['btn-small'],
                      styles.logout,
                    )}
                  >
                    {t('Logout')}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const UserMenu = (props) => {
  const { t } = useTranslation();
  const { allowedPages } = useNavigation();
  const { sendRequest: logoutRequest } = useRequest({
    request: postData,
  });
  const { sendRequest: userRequest } = useRequest({
    request: getData,
  });
  const navigate = useNavigate();
  const { showSuccessMessage } = useSnackbar();

  const setAreUserParametersLoaded = useUpdateAtom(areUserParametersLoadedAtom);

  const logout = () => {
    logoutRequest({
      data: {},
      endpoint: logoutEndpoint,
    }).then(() => {
      setAreUserParametersLoaded(false);
      navigate(reactRoutes.login);
      showSuccessMessage(t(labelYouHaveBeenLoggedOut));
    });
  };

  const getUser = () => userRequest({ endpoint: userEndpoint });

  return (
    <UserMenuContent
      {...props}
      allowedPages={allowedPages}
      getUser={getUser}
      logout={logout}
    />
  );
};

export default withStyles(MuiStyles)(withTranslation()(UserMenu));
