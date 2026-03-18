import * as React from "react";
import { useEffect, useRef } from "react";
import { XFrames } from "@xframes/node";
import { TableImperativeHandle } from "@xframes/common";
import { useUbxMessages } from "../hooks/useUbxMessages";

const columns = [
  { heading: "Time", fieldId: "timestamp" },
  { heading: "Message", fieldId: "name" },
  { heading: "Size", fieldId: "length", type: "number" as const },
];

export const MessageView = () => {
  const { messages, messageRate } = useUbxMessages();
  const tableRef = useRef<TableImperativeHandle>(null);

  useEffect(() => {
    if (tableRef.current && messages.length > 0) {
      tableRef.current.setTableData(messages);
    }
  }, [messages]);

  return (
    <XFrames.Node style={{ padding: { all: 8 }, flex: 1, gap: { row: 4 } }}>
      <XFrames.UnformattedText
        text={`Messages: ${messages.length} | Rate: ${messageRate} msg/s`}
      />
      <XFrames.Table
        ref={tableRef}
        columns={columns}
        clipRows={500}
        filterable
        style={{ flex: 1 }}
      />
    </XFrames.Node>
  );
};
