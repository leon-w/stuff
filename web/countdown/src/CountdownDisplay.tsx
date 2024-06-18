import { Flex, Progress, Typography } from "antd";

import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { useTimer } from "./TimerContext";
import { useAppState } from "./state";

dayjs.extend(duration);

export default function CountdownDisplay({ id }: { id: number }) {
    const countdown = useAppState(state => state.countdowns[id]);
    const time = useTimer();

    function formatTimeDelta({
        deltaMs,
        fontSize,
        prefix,
        suffix,
    }: {
        deltaMs: number;
        fontSize: string;
        prefix?: false | string;
        suffix?: false | string;
    }) {
        const d = dayjs.duration(Math.abs(deltaMs));
        const unitParts: React.ReactNode[] = [];
        for (const unit of countdown.units) {
            const isFirst = unit === countdown.units[0];
            const isLast = unit === countdown.units[countdown.units.length - 1];
            let value = 0;
            switch (unit) {
                case "year":
                    value = isFirst ? d.asYears() : d.years();
                    break;
                case "month":
                    value = isFirst ? d.asMonths() : d.months();
                    break;
                case "day":
                    value = isFirst ? d.asDays() : d.days();
                    break;
                case "hour":
                    value = isFirst ? d.asHours() : d.hours();
                    break;
                case "minute":
                    value = isFirst ? d.asMinutes() : d.minutes();
                    break;
                case "second":
                    value = isFirst ? d.asSeconds() : d.seconds();
                    break;
            }
            value = Math.floor(value);
            unitParts.push(
                <Typography.Text key={unit} strong keyboard style={{ fontSize }}>
                    {value}
                </Typography.Text>
            );
            unitParts.push(`${value > 1 || value === 0 ? unit + "s" : unit}${isLast ? "" : ","} `);
        }

        if (prefix) {
            unitParts.unshift(
                <Typography.Text key="prefix" type="secondary" style={{ fontSize }}>
                    {prefix}
                </Typography.Text>
            );
        }
        if (suffix) {
            unitParts.push(
                <Typography.Text key="suffix" type="secondary" style={{ fontSize }}>
                    {suffix}
                </Typography.Text>
            );
        }
        return <Typography.Text style={{ fontSize, textWrap: "nowrap" }}>{unitParts}</Typography.Text>;
    }

    let display;

    if (countdown.variant === "countdown") {
        const fontSize = "4vh";
        const deltaMs = countdown.end - time;
        let prefix = "";
        let suffix = "";

        if (deltaMs < 0) {
            suffix = "ago";
        } else {
            prefix = "in";
        }

        display = formatTimeDelta({ deltaMs, fontSize, prefix, suffix });
    } else {
        const fontSize = "2.5vh";
        let deltaMs = 0;
        let percent = 100;
        let prefix = "";
        let suffix = "";

        if (time > countdown.end) {
            deltaMs = 0;
            percent = 100;
            suffix = "left";
        } else if (time < countdown.start) {
            deltaMs = countdown.start - time;
            percent = 0;
            prefix = "in";
        } else {
            deltaMs = countdown.end - time;
            percent = 100 - (deltaMs / (countdown.end - countdown.start)) * 100;
            suffix = "left";
        }

        display = (
            <div style={{ width: "75vw" }}>
                <Progress
                    percent={percent}
                    percentPosition={{ align: "center", type: "outer" }}
                    format={() => formatTimeDelta({ deltaMs, fontSize, prefix, suffix })}
                    size={35}
                />
            </div>
        );
    }

    return (
        <Flex vertical align="center" gap="small">
            {countdown.label !== "" && (
                <Typography.Title
                    level={1}
                    style={{ marginBottom: 10, marginTop: 10, fontSize: "7vh", textAlign: "center" }}
                >
                    {countdown.label}
                </Typography.Title>
            )}
            {display}
        </Flex>
    );
}
