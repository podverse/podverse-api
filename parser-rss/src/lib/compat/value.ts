import { Phase4Value } from "podcast-partytime"

export const valueCompat = (val: Phase4Value) => {
  return {
    type: val.type,
    method: val.method,
    suggested: val.suggested,
    recipients: val.recipients.map((r) => {
      return {
        name: r.name,
        type: r.type,
        address: r.address,
        split: r.split.toString(),
        fee: r.fee,
        customKey: r.customKey,
        customValue: r.customValue
      }
    }),
    valueTimeSplits: val.valueTimeSplits
  }
}
