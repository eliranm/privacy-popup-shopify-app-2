import React, { useState, useCallback, useEffect } from 'react';
import {
  Page,
  Layout,
  Card,
  Form,
  FormLayout,
  TextField,
  Checkbox,
  Select,
  RangeSlider,
  Button,
  Banner,
  Text,
  Divider,
  ColorPicker,
  Popover,
  hsbToRgb,
  rgbToHsb,
} from '@shopify/polaris';
import { TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { Toast } from '@shopify/app-bridge/actions';

interface PopupSettings {
  popup_enabled: boolean;
  popup_title: string;
  popup_text: string;
  accept_text: string;
  decline_text: string;
  show_decline: boolean;
  privacy_policy_url: string;
  policy_link_text: string;
  position: string;
  delay: number;
  background_color: string;
  text_color: string;
  accept_button_color: string;
}

/**
 * Settings page component for configuring the privacy popup
 */
export function SettingsPage() {
  const app = useAppBridge();
  const [settings, setSettings] = useState<PopupSettings>({
    popup_enabled: true,
    popup_title: 'Privacy Notice',
    popup_text: 'We use cookies to improve your experience on our site. By continuing to browse, you agree to our use of cookies.',
    accept_text: 'Accept',
    decline_text: 'Decline',
    show_decline: false,
    privacy_policy_url: '',
    policy_link_text: 'Privacy Policy',
    position: 'bottom',
    delay: 2,
    background_color: '#ffffff',
    text_color: '#333333',
    accept_button_color: '#007cba',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [colorPickerActive, setColorPickerActive] = useState<string | null>(null);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      const toast = Toast.create(app, {
        message: 'Error loading settings',
        duration: 5000,
        isError: true,
      });
      toast.dispatch(Toast.Action.SHOW);
    } finally {
      setIsLoading(false);
    }
  }, [app]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const toast = Toast.create(app, {
          message: 'Settings saved successfully!',
          duration: 3000,
        });
        toast.dispatch(Toast.Action.SHOW);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      const toast = Toast.create(app, {
        message: 'Error saving settings',
        duration: 5000,
        isError: true,
      });
      toast.dispatch(Toast.Action.SHOW);
    } finally {
      setIsSaving(false);
    }
  }, [app, settings]);

  const handleFieldChange = useCallback((field: keyof PopupSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  }, []);

  const positionOptions = [
    { label: 'Bottom', value: 'bottom' },
    { label: 'Top', value: 'top' },
    { label: 'Center', value: 'center' },
  ];

  const hexToHsb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return rgbToHsb({ red: r * 255, green: g * 255, blue: b * 255 });
  };

  const hsbToHex = (hsb: any) => {
    const rgb = hsbToRgb(hsb);
    const toHex = (c: number) => {
      const hex = Math.round(c).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.red)}${toHex(rgb.green)}${toHex(rgb.blue)}`;
  };

  const renderColorPicker = (field: keyof PopupSettings, label: string, value: string) => (
    <Popover
      active={colorPickerActive === field}
      activator={
        <Button
          onClick={() => setColorPickerActive(colorPickerActive === field ? null : field)}
          disclosure
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                backgroundColor: value,
                border: '1px solid #ddd',
                borderRadius: '3px',
              }}
            />
            {label}
          </div>
        </Button>
      }
      onClose={() => setColorPickerActive(null)}
    >
      <Card>
        <div style={{ padding: '16px' }}>
          <ColorPicker
            color={hexToHsb(value)}
            onChange={(color) => handleFieldChange(field, hsbToHex(color))}
          />
        </div>
      </Card>
    </Popover>
  );

  if (isLoading) {
    return (
      <Page>
        <TitleBar title="Settings" />
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Text variant="bodyMd" as="p">Loading settings...</Text>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar title="Privacy Popup Settings" />
      
      <Layout>
        <Layout.Section>
          <Banner
            title="Customize Your Privacy Popup"
            status="info"
          >
            <p>
              Configure how your privacy popup appears and behaves on your storefront. 
              Remember to activate the app embed in your theme editor after making changes.
            </p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Form onSubmit={handleSave}>
            <FormLayout>
              <Card>
                <div style={{ padding: '20px' }}>
                  <Text variant="headingMd" as="h2">General Settings</Text>
                  <div style={{ marginTop: '16px' }}>
                    <FormLayout>
                      <Checkbox
                        label="Enable privacy popup"
                        checked={settings.popup_enabled}
                        onChange={(value) => handleFieldChange('popup_enabled', value)}
                      />
                    </FormLayout>
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ padding: '20px' }}>
                  <Text variant="headingMd" as="h2">Content</Text>
                  <div style={{ marginTop: '16px' }}>
                    <FormLayout>
                      <TextField
                        label="Popup title"
                        value={settings.popup_title}
                        onChange={(value) => handleFieldChange('popup_title', value)}
                        autoComplete="off"
                      />
                      
                      <TextField
                        label="Popup text"
                        value={settings.popup_text}
                        onChange={(value) => handleFieldChange('popup_text', value)}
                        multiline={4}
                        autoComplete="off"
                      />
                      
                      <TextField
                        label="Accept button text"
                        value={settings.accept_text}
                        onChange={(value) => handleFieldChange('accept_text', value)}
                        autoComplete="off"
                      />
                      
                      <Checkbox
                        label="Show decline button"
                        checked={settings.show_decline}
                        onChange={(value) => handleFieldChange('show_decline', value)}
                      />
                      
                      {settings.show_decline && (
                        <TextField
                          label="Decline button text"
                          value={settings.decline_text}
                          onChange={(value) => handleFieldChange('decline_text', value)}
                          autoComplete="off"
                        />
                      )}
                      
                      <TextField
                        label="Privacy policy URL"
                        value={settings.privacy_policy_url}
                        onChange={(value) => handleFieldChange('privacy_policy_url', value)}
                        type="url"
                        autoComplete="off"
                        helpText="Optional: Link to your privacy policy"
                      />
                      
                      {settings.privacy_policy_url && (
                        <TextField
                          label="Privacy policy link text"
                          value={settings.policy_link_text}
                          onChange={(value) => handleFieldChange('policy_link_text', value)}
                          autoComplete="off"
                        />
                      )}
                    </FormLayout>
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ padding: '20px' }}>
                  <Text variant="headingMd" as="h2">Display Settings</Text>
                  <div style={{ marginTop: '16px' }}>
                    <FormLayout>
                      <Select
                        label="Popup position"
                        options={positionOptions}
                        value={settings.position}
                        onChange={(value) => handleFieldChange('position', value)}
                      />
                      
                      <RangeSlider
                        label={`Show delay: ${settings.delay} seconds`}
                        value={settings.delay}
                        onChange={(value) => handleFieldChange('delay', value)}
                        min={0}
                        max={10}
                        step={1}
                        output
                      />
                    </FormLayout>
                  </div>
                </div>
              </Card>

              <Card>
                <div style={{ padding: '20px' }}>
                  <Text variant="headingMd" as="h2">Colors</Text>
                  <div style={{ marginTop: '16px' }}>
                    <FormLayout>
                      <FormLayout.Group>
                        {renderColorPicker('background_color', 'Background Color', settings.background_color)}
                        {renderColorPicker('text_color', 'Text Color', settings.text_color)}
                        {renderColorPicker('accept_button_color', 'Accept Button Color', settings.accept_button_color)}
                      </FormLayout.Group>
                    </FormLayout>
                  </div>
                </div>
              </Card>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <Button primary submit loading={isSaving}>
                  Save Settings
                </Button>
              </div>
            </FormLayout>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
