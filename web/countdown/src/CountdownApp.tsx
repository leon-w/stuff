import React from "react";

import { App, Button, Card, ConfigProvider, Flex, FloatButton, List, Modal, Switch, Typography, theme } from "antd";
import { PlusOutlined, SettingFilled } from "@ant-design/icons";

import { TimerProvider } from "./TimerContext";
import { useDarkMode, useAppState } from "./state";
import CountdownDisplay from "./CountdownDisplay";
import CountdownSettings from "./CountdownSettings";

// this is a hack to get the background color to update when the dark mode switch is toggled
// it must be a child of the ConfigProvider to work
function Background({ children }: { children: React.ReactNode }) {
    const { useToken } = theme;
    const { token } = useToken();

    return (
        <App
            style={{
                backgroundColor: token.colorBgBase,
                height: "100vh",
                overflowY: "auto",
                scrollbarWidth: "none",
            }}
        >
            {children}
        </App>
    );
}

function CountdownApp() {
    const [modalOpen, setModalOpen] = React.useState(false);
    const { darkMode, toggleDarkMode } = useDarkMode();
    const { defaultAlgorithm, darkAlgorithm } = theme;

    const createCountdown = useAppState(state => state.createCountdown);
    const countdowns = useAppState(state => state.countdowns);
    const enabledCountdowns = Object.entries(countdowns)
        .filter(([, countdown]) => countdown.enabled)
        .map(([id]) => id);

    return (
        <ConfigProvider theme={{ algorithm: darkMode ? darkAlgorithm : defaultAlgorithm }}>
            <Background>
                <FloatButton
                    icon={<SettingFilled />}
                    tooltip="Configure Countdowns"
                    onClick={() => setModalOpen(true)}
                />
                <Modal
                    title="Configure Countdowns"
                    centered
                    width={700}
                    open={modalOpen}
                    onOk={() => setModalOpen(false)}
                    onCancel={() => setModalOpen(false)}
                    footer={[
                        <Switch
                            key={0}
                            checkedChildren="Dark"
                            unCheckedChildren="Light"
                            checked={darkMode}
                            onChange={toggleDarkMode}
                            style={{ marginRight: 10 }}
                        />,
                        <Button
                            key={1}
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => createCountdown("countdown")}
                        >
                            Add Countdown
                        </Button>,
                    ]}
                >
                    <Card
                        style={{ overflow: "auto", height: "55vh" }}
                        styles={{ body: { padding: "0 12px 12px 12px" } }}
                    >
                        <List
                            dataSource={Object.keys(countdowns)}
                            renderItem={id => (
                                <List.Item key={id}>
                                    <CountdownSettings id={Number(id)} />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Modal>
                <Flex
                    vertical
                    justify={enabledCountdowns.length === 0 ? "center" : "space-evenly"}
                    align="center"
                    style={{ height: "100%" }}
                >
                    {enabledCountdowns.length > 0 ? (
                        <TimerProvider>
                            {enabledCountdowns.map(id => (
                                <CountdownDisplay key={id} id={Number(id)} />
                            ))}
                        </TimerProvider>
                    ) : (
                        <>
                            <Typography.Title level={4} type="secondary">
                                No countdowns configured.
                            </Typography.Title>
                            <Typography.Text type="secondary">
                                Click the settings button in the bottom right to add a countdown.
                            </Typography.Text>
                        </>
                    )}
                </Flex>
            </Background>
        </ConfigProvider>
    );
}

export default CountdownApp;
