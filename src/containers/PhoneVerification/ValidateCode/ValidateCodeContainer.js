/* eslint max-lines: 0 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import tr from '../../../../translate';
import { phoneVerificationTime } from '../../../../helpers/timers';
import { getErrorMessage } from '../../../../helpers/apiResponse';
import ValidateCode from './ValidateCode';
import actions from '../../../../actions/';

class ValidationCode extends PureComponent {
  static propTypes = {
    editPhoneNumber: PropTypes.func.isRequired,
    phoneNumber: PropTypes.string.isRequired,
    reSendSms: PropTypes.func.isRequired,
    pending: PropTypes.shape({}).isRequired,
    lastSend: PropTypes.instanceOf(Date),
    submitPending: PropTypes.func.isRequired,
    submitSuccess: PropTypes.func.isRequired,
    submitError: PropTypes.func.isRequired,
    setPhoneVerified: PropTypes.func.isRequired,
    sendVerifCode: PropTypes.func.isRequired,
    code: PropTypes.number
  };

  static defaultProps = {
    lastSend: null,
    code: null
  };

  state = {
    error: ''
  };

  checkReSend = () => {
    const { reSendSms, lastSend, phoneNumber } = this.props;
    this.setState({ error: '' });

    return lastSend && phoneVerificationTime(lastSend)
      ? this.setState({
        error: tr('errors.phone.wait_resend')
      })
      : reSendSms(phoneNumber);
  };

  sendCode = code => {
    const {
      phoneNumber,
      submitPending,
      submitSuccess,
      submitError,
      sendVerifCode,
      setPhoneVerified
    } = this.props;

    submitPending();

    sendVerifCode({
      code,
      phoneNumber,
      onSuccess: () => {
        submitSuccess();
        setPhoneVerified();
      },

      onError: (errors, res) => {
        submitError();
        return this.setState({ error: getErrorMessage(errors, res) });
      }
    });
  };

  render() {
    const { error } = this.state;
    const { editPhoneNumber, pending, phoneNumber, code } = this.props;
    return (
      <ValidateCode
        phoneNumber={phoneNumber}
        error={error}
        editPhoneNumber={editPhoneNumber}
        isPending={pending.SUBMIT_VALIDATION_CODE}
        sendCode={this.sendCode}
        reSendSms={this.checkReSend}
        code={code}
      />
    );
  }
}

const mapStateToProps = state => ({
  pending: state.pending
});

const mapDispatchToProps = dispatch => ({
  sendVerifCode: params => dispatch(actions.onboard.sendVerifCode(params)),
  submitPending: () => dispatch({ type: 'SUBMIT_VALIDATION_CODE_PENDING' }),
  submitSuccess: () => dispatch({ type: 'SUBMIT_VALIDATION_CODE_SUCCESS' }),
  submitError: () => dispatch({ type: 'SUBMIT_VALIDATION_CODE_ERROR' }),
  setPhoneVerified: () => dispatch({ type: 'SET_PHONE_VERIFIED' })
});

export default connect(mapStateToProps, mapDispatchToProps)(ValidationCode);