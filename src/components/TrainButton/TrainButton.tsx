'use client';
import { Button } from "@mantine/core";
import { IconPlayerPlay } from "@tabler/icons-react";
import { useMemo } from "react";

type TrainButtonProps = {
  display: boolean;
  status?: 'training' | 'trained';
  onClick?: () => void
}

const TrainButton = ({ display, status, onClick = () => { } }: TrainButtonProps) => {
  const text = useMemo(() => {
    if (!status) {
      return 'Train'
    }
    if (status === 'training') {
      return 'Training'
    }
    if (status === 'trained') {
      return 'Re-train'
    }
    if (status === 're-training') {
      return 'Re-training'
    }
  }, [status])

  const isTraining = ['re-training', 'training'].includes(status || "")

  return display ? (
    <Button onClick={isTraining ? undefined : onClick} rightSection={!isTraining && <IconPlayerPlay />} loading={isTraining}>
      {text}
    </Button>
  ) : null
}

export default TrainButton;