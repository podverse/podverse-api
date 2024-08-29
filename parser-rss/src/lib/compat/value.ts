import { Phase4Value, Phase4ValueRecipient } from "podcast-partytime"

export const compatChannelValue = (value: Phase4Value) => {
  return {
    type: value.type,
    method: value.method,
    suggested: parseFloat(value.suggested ?? '0') || null,
    channel_value_recipients: compatValueRecipients(value.recipients)
  }
}

export const compatItemValue = (value: Phase4Value) => {
  return {
    type: value.type,
    method: value.method,
    suggested: value.suggested,
    item_value_recipients: compatValueRecipients(value.recipients),
    item_value_time_splits: value.valueTimeSplits?.map((valueTimeSplit) => {
      if (valueTimeSplit.type === 'remoteItem') {
        return {
          start_time: valueTimeSplit.startTime,
          duration: valueTimeSplit.duration,
          remote_start_time: valueTimeSplit.remoteStartTime,
          remote_percentage: valueTimeSplit.remotePercentage,
          item_value_time_splits_recipients: []
        }
      } else {
        // else: valueTimeSplit.type === 'recipients'
        return {
          start_time: valueTimeSplit.startTime,
          duration: valueTimeSplit.duration,
          remote_start_time: null,
          remote_percentage: null,
          item_value_time_splits_recipients: compatValueRecipients(valueTimeSplit.recipients)
        }
      }
    }) || []
  }
}

const compatValueRecipients = (recipients: Phase4ValueRecipient[]) => {
  return recipients.map((recipient) => {
    return {
      type: recipient.type,
      address: recipient.address,
      split: recipient.split,
      name: recipient.name || null,
      custom_key: recipient.customKey || null,
      custom_value: recipient.customValue || null,
      fee: recipient.fee || false
    }
  }) || []
}
