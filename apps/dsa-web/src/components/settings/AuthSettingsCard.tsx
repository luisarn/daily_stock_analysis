import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/auth';
import { getParsedApiError, isParsedApiError, type ParsedApiError } from '../../api/error';
import { useAuth } from '../../hooks';
import { Badge, Button, Input, Checkbox } from '../common';
import { SettingsAlert } from './SettingsAlert';
import { SettingsSectionCard } from './SettingsSectionCard';

function createNextModeLabel(
  t: (key: string) => string,
  authEnabled: boolean,
  desiredEnabled: boolean,
) {
  if (authEnabled && !desiredEnabled) {
    return t('auth.actionModeLabels.disableAuth');
  }
  if (!authEnabled && desiredEnabled) {
    return t('auth.actionModeLabels.enableAuth');
  }
  return authEnabled
    ? t('auth.actionModeLabels.keepEnabled')
    : t('auth.actionModeLabels.keepDisabled');
}

export const AuthSettingsCard: React.FC = () => {
  const { t } = useTranslation('settings');
  const { authEnabled, setupState, refreshStatus } = useAuth();
  const [desiredEnabled, setDesiredEnabled] = useState(authEnabled);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | ParsedApiError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDirty = desiredEnabled !== authEnabled || currentPassword || password || passwordConfirm;
  const targetActionLabel = createNextModeLabel(t, authEnabled, desiredEnabled);

  const helperText = useMemo(() => {
    switch (setupState) {
      case 'no_password':
        return t('auth.helper.no_password');
      case 'password_retained':
        return t('auth.helper.password_retained');
      case 'enabled':
        return !desiredEnabled
          ? t('auth.helper.enabled_disable')
          : t('auth.helper.enabled_keep');
      default:
        return t('auth.helper.default');
    }
  }, [setupState, desiredEnabled, t]);

  useEffect(() => {
    setDesiredEnabled(authEnabled);
  }, [authEnabled]);

  const resetForm = () => {
    setCurrentPassword('');
    setPassword('');
    setPasswordConfirm('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Initial setup validation
    if (setupState === 'no_password' && desiredEnabled) {
      if (!password) {
        setError(t('auth.validationNewPasswordRequired'));
        return;
      }
      if (password !== passwordConfirm) {
        setError(t('auth.validationPasswordMismatch'));
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await authApi.updateSettings(
        desiredEnabled,
        password.trim() || undefined,
        passwordConfirm.trim() || undefined,
        currentPassword.trim() || undefined,
      );
      await refreshStatus();
      setSuccessMessage(desiredEnabled ? t('auth.successEnabled') : t('auth.successDisabled'));
      resetForm();
    } catch (err: unknown) {
      setError(getParsedApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SettingsSectionCard
      title={t('auth.sectionTitle')}
      description={t('auth.sectionDescription')}
      actions={
        <Badge variant={authEnabled ? 'success' : 'default'} size="sm">
          {authEnabled ? t('auth.statusEnabled') : t('auth.statusDisabled')}
        </Badge>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 shadow-soft-card-strong transition-all hover:bg-muted/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{t('auth.adminAuth')}</p>
              <p className="text-xs leading-6 text-muted-text">{helperText}</p>
            </div>
            <Checkbox
              checked={desiredEnabled}
              disabled={isSubmitting}
              label={desiredEnabled ? t('auth.checkboxEnabled') : t('auth.checkboxDisabled')}
              onChange={(event) => setDesiredEnabled(event.target.checked)}
              containerClassName="bg-muted/30 border border-border/50 rounded-full px-4 py-2 shadow-soft-card-strong transition-all hover:bg-muted/40"
            />
          </div>
        </div>

        {/* Password input fields logic based on setupState and desiredEnabled */}
        {(desiredEnabled || (authEnabled && !desiredEnabled)) && (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Show Current Password if we have one and we're either re-enabling or turning off */}
            {(setupState === 'password_retained' && desiredEnabled) ||
             (setupState === 'enabled' && !desiredEnabled) ? (
              <div className="space-y-3">
                <Input
                  label={t('auth.currentPassword')}
                  type="password"
                  allowTogglePassword
                  iconType="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  placeholder={t('auth.currentPasswordPlaceholder')}
                  hint={setupState === 'password_retained' ? t('auth.currentPasswordHintRetained') : t('auth.currentPasswordHintDisable')}
                />
              </div>
            ) : null}

            {/* Show New Password fields only during initial setup */}
            {setupState === 'no_password' && desiredEnabled ? (
              <>
                <div className="space-y-3">
                  <Input
                    label={t('auth.newPassword')}
                    type="password"
                    allowTogglePassword
                    iconType="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    placeholder={t('auth.newPasswordPlaceholder')}
                  />
                </div>
                <div className="space-y-3">
                  <Input
                    label={t('auth.confirmPassword')}
                    type="password"
                    allowTogglePassword
                    iconType="password"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    placeholder={t('auth.confirmPasswordPlaceholder')}
                  />
                </div>
              </>
            ) : null}
          </div>
        )}

        {error ? (
          isParsedApiError(error) ? (
            <SettingsAlert
              title={t('auth.errorTitle')}
              message={error.message}
              variant="error"
            />
          ) : (
            <SettingsAlert title={t('auth.errorTitle')} message={error} variant="error" />
          )
        ) : null}

        {successMessage ? (
          <SettingsAlert title={t('auth.successTitle')} message={successMessage} variant="success" />
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" variant="settings-primary" isLoading={isSubmitting} disabled={!isDirty}>
            {targetActionLabel}
          </Button>
          <Button
            type="button"
            variant="settings-secondary"
            onClick={() => {
              setDesiredEnabled(authEnabled);
              setError(null);
              setSuccessMessage(null);
              resetForm();
            }}
            disabled={isSubmitting || !isDirty}
          >
            {t('auth.revert')}
          </Button>
        </div>
      </form>
    </SettingsSectionCard>
  );
};
