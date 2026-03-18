function checksum(data: Buffer): [number, number] {
  let ckA = 0;
  let ckB = 0;
  for (let i = 0; i < data.length; i++) {
    ckA = (ckA + data[i]) & 0xff;
    ckB = (ckB + ckA) & 0xff;
  }
  return [ckA, ckB];
}

function buildUbxFrame(msgClass: number, msgId: number, payload: Buffer): Buffer {
  const frame = Buffer.alloc(8 + payload.length);
  frame[0] = 0xb5; // sync1
  frame[1] = 0x62; // sync2
  frame[2] = msgClass;
  frame[3] = msgId;
  frame.writeUInt16LE(payload.length, 4);
  payload.copy(frame, 6);
  const [ckA, ckB] = checksum(frame.subarray(2, 6 + payload.length));
  frame[6 + payload.length] = ckA;
  frame[7 + payload.length] = ckB;
  return frame;
}

function buildCfgValset(keys: { keyId: number; value: number }[]): Buffer {
  // Header: version(1) + layers(1) + reserved(2) = 4 bytes
  // Each key: keyId(4) + value(1) = 5 bytes (U1 size keys only)
  const payload = Buffer.alloc(4 + keys.length * 5);
  payload[0] = 0x00; // version
  payload[1] = 0x01; // layers: RAM only
  payload.writeUInt16LE(0, 2); // reserved
  let offset = 4;
  for (const { keyId, value } of keys) {
    payload.writeUInt32LE(keyId, offset);
    payload[offset + 4] = value;
    offset += 5;
  }
  // CFG-VALSET: class=0x06, id=0x8A
  return buildUbxFrame(0x06, 0x8a, payload);
}

export function enableUbxNavMessages(): Buffer {
  return buildCfgValset([
    { keyId: 0x20910007, value: 1 }, // CFG-MSGOUT-UBX_NAV_PVT_UART1
    { keyId: 0x20910016, value: 1 }, // CFG-MSGOUT-UBX_NAV_SAT_UART1
    { keyId: 0x20910039, value: 1 }, // CFG-MSGOUT-UBX_NAV_DOP_UART1
    { keyId: 0x209101b5, value: 1 }, // CFG-MSGOUT-UBX_MON_HW_UART1
    { keyId: 0x2091001b, value: 1 }, // CFG-MSGOUT-UBX_NAV_STATUS_UART1
  ]);
}
