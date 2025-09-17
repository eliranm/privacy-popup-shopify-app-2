import React, { useState, useCallback } from 'react';
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Banner,
  List,
  Link,
  Icon,
  ButtonGroup,
} from '@shopify/polaris';
import { ExternalMinor, SettingsMinor, ViewMinor } from '@shopify/polaris-icons';
import { TitleBar } from '@shopify/app-bridge-react';
import { useNavigate } from 'react-router-dom';

/**
 * Home page component displaying app overview and quick actions
 */
export function HomePage() {
  const navigate = useNavigate();
  const [isActivating, setIsActivating] = useState(false);

  const handleActivateExtension = useCallback(async () => {
    setIsActivating(true);
    try {
      // Redirect to theme editor with extension activation
      window.open('/api/theme-extension/activate', '_blank');
    } catch (error) {
      console.error('Error activating extension:', error);
    } finally {
      setIsActivating(false);
    }
  }, []);

  const handleViewSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  return (
    <Page>
      <TitleBar title="Privacy Popup" />
      
      <Layout>
        <Layout.Section>
          <Banner
            title="Welcome to Privacy Popup!"
            status="success"
          >
            <p>
              Your privacy popup app is ready to use. Follow the steps below to activate 
              the popup on your storefront.
            </p>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingMd" as="h2">
                Quick Setup Guide
              </Text>
              <div style={{ marginTop: '16px' }}>
                <List type="number">
                  <List.Item>
                    Click "Activate in Theme Editor" below to open your theme editor
                  </List.Item>
                  <List.Item>
                    In the theme editor, look for "App embeds" in the left sidebar
                  </List.Item>
                  <List.Item>
                    Find "Privacy Popup" and toggle it on
                  </List.Item>
                  <List.Item>
                    Customize the popup text, colors, and behavior in the settings
                  </List.Item>
                  <List.Item>
                    Save your changes and preview your store
                  </List.Item>
                </List>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingMd" as="h2">
                Quick Actions
              </Text>
              <div style={{ marginTop: '20px' }}>
                <ButtonGroup>
                  <Button
                    primary
                    icon={ExternalMinor}
                    loading={isActivating}
                    onClick={handleActivateExtension}
                  >
                    Activate in Theme Editor
                  </Button>
                  <Button
                    icon={SettingsMinor}
                    onClick={handleViewSettings}
                  >
                    Configure Settings
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingMd" as="h2">
                Features
              </Text>
              <div style={{ marginTop: '16px' }}>
                <List>
                  <List.Item>
                    <strong>Customizable Text:</strong> Edit the popup title and message
                  </List.Item>
                  <List.Item>
                    <strong>Flexible Positioning:</strong> Choose top, center, or bottom placement
                  </List.Item>
                  <List.Item>
                    <strong>Color Theming:</strong> Match your brand colors
                  </List.Item>
                  <List.Item>
                    <strong>Accept/Decline Options:</strong> Optional decline button
                  </List.Item>
                  <List.Item>
                    <strong>Privacy Policy Link:</strong> Link to your privacy policy
                  </List.Item>
                  <List.Item>
                    <strong>Mobile Responsive:</strong> Works perfectly on all devices
                  </List.Item>
                  <List.Item>
                    <strong>Cookie Memory:</strong> Remembers user choice for 1 year
                  </List.Item>
                </List>
              </div>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section secondary>
          <Card>
            <div style={{ padding: '20px' }}>
              <Text variant="headingMd" as="h2">
                Need Help?
              </Text>
              <div style={{ marginTop: '16px' }}>
                <Text variant="bodyMd" as="p">
                  If you need assistance setting up your privacy popup, check out these resources:
                </Text>
                <div style={{ marginTop: '12px' }}>
                  <List>
                    <List.Item>
                      <Link 
                        url="https://help.shopify.com/en/manual/online-store/themes/theme-structure/extend/apps"
                        external
                      >
                        Shopify Theme App Documentation
                      </Link>
                    </List.Item>
                    <List.Item>
                      <Link 
                        url="https://shopify.dev/docs/apps/build/online-store/theme-app-extensions"
                        external
                      >
                        Theme App Extensions Guide
                      </Link>
                    </List.Item>
                  </List>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
