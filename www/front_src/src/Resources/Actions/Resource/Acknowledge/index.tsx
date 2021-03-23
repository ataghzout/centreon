import * as React from 'react';

import { Severity, useSnackbar, useRequest } from '@centreon/ui';

import {
  labelRequired,
  labelAcknowledgeCommandSent,
  labelAcknowledgedBy,
} from '../../../translatedLabels';
import { Resource } from '../../../models';
import { useUserContext } from '../../../../Provider/UserContext';
import { acknowledgeResources } from '../../api';

import DialogAcknowledge from './Dialog';

import { isNil } from 'ramda';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useFormik } from 'formik';

const validationSchema = Yup.object().shape({
  comment: Yup.string().required(labelRequired),
  notify: Yup.boolean(),
});

interface Props {
  resources: Array<Resource>;
  onClose;
  onSuccess;
}

const AcknowledgeForm = ({
  resources,
  onClose,
  onSuccess,
}: Props): JSX.Element | null => {
  const { t } = useTranslation();
  const { showMessage } = useSnackbar();

  const { alias } = useUserContext();

  const {
    sendRequest: sendAcknowledgeResources,
    sending: sendingAcknowledgeResources,
  } = useRequest({
    request: acknowledgeResources,
  });

  const showSuccess = (message): void =>
    showMessage({ message, severity: Severity.success });

  const form = useFormik({
    initialValues: {
      comment: undefined,
      notify: false,
      acknowledgeAttachedResources: false,
    },
    onSubmit: (values) => {
      sendAcknowledgeResources({
        resources,
        params: values,
      }).then(() => {
        showSuccess(t(labelAcknowledgeCommandSent));
        onSuccess();
      });
    },
    validationSchema,
  });

  React.useEffect(() => {
    form.setFieldValue('comment', `${t(labelAcknowledgedBy)} ${alias}`);
  }, []);

  return (
    <DialogAcknowledge
      resources={resources}
      onConfirm={form.submitForm}
      onCancel={onClose}
      canConfirm={form.isValid}
      errors={form.errors}
      values={form.values}
      handleChange={form.handleChange}
      submitting={sendingAcknowledgeResources}
      loading={isNil(form.values.comment)}
    />
  );
};

export default AcknowledgeForm;
