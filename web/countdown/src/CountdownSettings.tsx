import { DeleteOutlined } from "@ant-design/icons";
import { App, Button, Card, Checkbox, DatePicker, Flex, Form, Input, Select, Switch, Tooltip } from "antd";
import { useAppState, Unit, ALL_UNITS } from "./state";
import dayjs from "dayjs";

export default function CountdownSettings({ id }: { id: number }) {
    const { message } = App.useApp();

    const countdown = useAppState(state => state.countdowns[id]);
    const removeCountdown = useAppState(state => state.removeCountdown);
    const addCountdown = useAppState(state => state.addCountdown);

    const changeVariant = useAppState(state => state.changeVariant);
    const setLabel = useAppState(state => state.setLabel);
    const setUnits = useAppState(state => state.setUnits);
    const setStart = useAppState(state => state.setStart);
    const setEnd = useAppState(state => state.setEnd);
    const setEnabled = useAppState(state => state.setEnabled);

    const handleDelete = () => {
        removeCountdown(id);
        message.success({
            content: (
                <>
                    Countdown removed.
                    <Button
                        type="link"
                        onClick={() => {
                            message.destroy(id);
                            addCountdown(id, countdown);
                        }}
                    >
                        Undo
                    </Button>
                </>
            ),
            duration: 5,
            key: id,
        });
    };

    const hasStart = countdown.variant === "duration";

    return (
        <Card style={{ width: "100%" }} styles={{ body: { padding: 12 } }}>
            <Form labelCol={{ span: 2 }}>
                <Form.Item label="Label" style={{ marginBottom: 10 }}>
                    <Input
                        placeholder="Countdown label"
                        value={countdown.label}
                        onChange={e => setLabel(id, e.target.value)}
                    />
                </Form.Item>
                <Form.Item label="Time" style={{ marginBottom: 10 }}>
                    <Flex align="center" gap="small">
                        {hasStart ? (
                            <DatePicker.RangePicker
                                showTime
                                style={{ width: "100%" }}
                                value={[dayjs(countdown.start), dayjs(countdown.end)]}
                                onChange={dates => {
                                    if (dates) {
                                        const [start, end] = dates.map(date => date?.valueOf() ?? 0);
                                        setStart(id, start);
                                        setEnd(id, end);
                                    }
                                }}
                            />
                        ) : (
                            <DatePicker
                                showTime
                                style={{ width: "100%" }}
                                value={dayjs(countdown.end)}
                                onChange={date => setEnd(id, date?.valueOf() ?? 0)}
                            />
                        )}
                        <Tooltip title="Include a start time to create a progress bar">
                            <Checkbox
                                checked={hasStart}
                                onChange={() => changeVariant(id, hasStart ? "countdown" : "duration")}
                            >
                                Start
                            </Checkbox>
                        </Tooltip>
                    </Flex>
                </Form.Item>
                <Form.Item label="Units" style={{ marginBottom: 10 }}>
                    <Select
                        mode="multiple"
                        allowClear
                        style={{ width: "100%" }}
                        placeholder="Select time units"
                        value={countdown.units}
                        onChange={(value: Unit[]) => setUnits(id, value)}
                        options={ALL_UNITS.map(unit => ({
                            label: unit.slice(0, 1).toUpperCase() + unit.slice(1),
                            value: unit,
                        }))}
                    />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                    <Flex gap="middle" align="center">
                        <Switch
                            checkedChildren="Show"
                            unCheckedChildren="Hide"
                            checked={countdown.enabled}
                            onChange={enabled => setEnabled(id, enabled)}
                        />
                        <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                            Remove
                        </Button>
                    </Flex>
                </Form.Item>
            </Form>
        </Card>
    );
}
