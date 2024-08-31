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
    suggested: parseFloat(value.suggested ?? '0') || null,
    item_value_recipients: compatValueRecipients(value.recipients),
    item_value_time_splits: value.valueTimeSplits?.map((valueTimeSplit) => {
      if (valueTimeSplit.type === 'remoteItem') {
        return {
          meta: {
            start_time: valueTimeSplit.startTime.toFixed(2),
            duration: valueTimeSplit.duration.toFixed(2),
            remote_start_time: valueTimeSplit.remoteStartTime?.toFixed(2) || (0).toFixed(2),
            remote_percentage: valueTimeSplit.remotePercentage?.toFixed(2) || (100).toFixed(2),
          },
          item_value_time_splits_recipients: [],
          item_value_time_splits_remote_item: valueTimeSplit.remoteItem ? {
            feed_guid: valueTimeSplit.remoteItem.feedGuid,
            feed_url: valueTimeSplit.remoteItem.feedUrl || null,
            item_guid: valueTimeSplit.remoteItem.itemGuid || null,
            title: /* TODO: ri.title || */ null
          } : null
        }
      } else {
        // else: valueTimeSplit.type === 'recipients'
        return {
          meta: {
            start_time: valueTimeSplit.startTime.toFixed(2),
            duration: valueTimeSplit.duration.toFixed(2),
            remote_start_time: (0).toFixed(2),
            remote_percentage: (100).toFixed(2),
          },
          item_value_time_splits_recipients: compatValueRecipients(valueTimeSplit.recipients),
          item_value_time_splits_remote_item: null
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
