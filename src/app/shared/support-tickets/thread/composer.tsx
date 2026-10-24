'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  PiImageBold,
  PiMapPinBold,
  PiMicrophoneBold,
  PiPaperPlaneRightBold,
  PiStopFill,
  PiUploadSimpleBold,
  PiXBold,
} from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Title } from '@/components/ui/text';
import { useSendSupportMedia, useSendSupportMessage } from '@/framework/support-tickets';
import type { SupportMessage } from '@/types/support-tickets';
import { formatDuration, newClientMessageId } from '../utils';

const MAX_TEXT = 5000;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VOICE_BYTES = 15 * 1024 * 1024;
const MAX_VOICE_SECONDS = 300;

interface Props {
  ticketId: string | number;
  onSent: (message: SupportMessage) => void;
}

function readImageSize(file: File) {
  return new Promise<{ width?: number; height?: number }>((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({});
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function readAudioDuration(file: Blob) {
  return new Promise<number | undefined>((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      const d = audio.duration;
      resolve(Number.isFinite(d) ? d : undefined);
      URL.revokeObjectURL(url);
    };
    audio.onerror = () => {
      resolve(undefined);
      URL.revokeObjectURL(url);
    };
    audio.src = url;
  });
}

function pickRecorderMime() {
  if (typeof MediaRecorder === 'undefined') return undefined;
  return ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((type) =>
    MediaRecorder.isTypeSupported(type)
  );
}

export default function SupportComposer({ ticketId, onSent }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const pendingTextId = useRef<string | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const voiceInput = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelRecording = useRef(false);

  const sendText = useSendSupportMessage(ticketId, t('st_send_error'));
  const sendMedia = useSendSupportMedia(ticketId, t('st_send_error'));
  const busy = sendText.isPending || sendMedia.isPending;

  useEffect(
    () => () => {
      cancelRecording.current = true;
      recorderRef.current?.stop();
      if (recordTimer.current) clearInterval(recordTimer.current);
    },
    []
  );

  const submitText = async () => {
    const body = text.trim();
    if (!body || busy) return;
    pendingTextId.current ??= newClientMessageId();
    try {
      const message = await sendText.mutateAsync({
        type: 'text',
        body,
        client_message_id: pendingTextId.current,
      });
      pendingTextId.current = null;
      setText('');
      if (message?.id) onSent(message);
    } catch {
      // keep text and client_message_id so a retry is de-duplicated
    }
  };

  const submitLocation = async () => {
    const la = Number(lat);
    const ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln) || Math.abs(la) > 90 || Math.abs(ln) > 180) {
      toast.error(t('st_location_invalid'));
      return;
    }
    try {
      const message = await sendText.mutateAsync({
        type: 'location',
        body: `${la},${ln}`,
        client_message_id: newClientMessageId(),
      });
      setLocationOpen(false);
      setLat('');
      setLng('');
      if (message?.id) onSent(message);
    } catch {
      // toast handled in hook
    }
  };

  const fillMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
      },
      () => toast.error(t('st_location_unavailable'))
    );
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('st_image_invalid'));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(t('st_image_too_large'));
      return;
    }
    const size = await readImageSize(file);
    try {
      const message = await sendMedia.mutateAsync({
        type: 'image',
        file,
        client_message_id: newClientMessageId(),
        metadata: size,
      });
      if (message?.id) onSent(message);
    } catch {
      // toast handled in hook
    }
  };

  const uploadVoice = async (file: Blob, fileName?: string, knownDuration?: number) => {
    if (file.size > MAX_VOICE_BYTES) {
      toast.error(t('st_voice_too_large'));
      return;
    }
    const duration = knownDuration ?? (await readAudioDuration(file));
    if (duration && duration > MAX_VOICE_SECONDS) {
      toast.error(t('st_voice_too_long'));
      return;
    }
    try {
      const message = await sendMedia.mutateAsync({
        type: 'voice',
        file,
        fileName,
        client_message_id: newClientMessageId(),
        metadata: duration ? { duration_seconds: Math.max(1, Math.round(duration)) } : undefined,
      });
      if (message?.id) onSent(message);
    } catch {
      // toast handled in hook
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      toast.error(t('st_record_unsupported'));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickRecorderMime();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: BlobPart[] = [];
      const startedAt = Date.now();
      cancelRecording.current = false;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (recordTimer.current) clearInterval(recordTimer.current);
        setRecording(false);
        setRecordSeconds(0);
        if (cancelRecording.current || chunks.length === 0) return;
        const type = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type });
        const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
        const seconds = Math.min(MAX_VOICE_SECONDS, (Date.now() - startedAt) / 1000);
        void uploadVoice(blob, `voice-${Date.now()}.${ext}`, seconds);
      };

      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setRecordSeconds(0);
      recordTimer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000);
        setRecordSeconds(elapsed);
        if (elapsed >= MAX_VOICE_SECONDS) recorder.stop();
      }, 500);
    } catch {
      toast.error(t('st_record_denied'));
    }
  };

  const stopRecording = (cancel = false) => {
    cancelRecording.current = cancel;
    recorderRef.current?.stop();
    recorderRef.current = null;
  };

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      {recording ? (
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          <span className="text-sm font-medium text-gray-700" dir="ltr">
            {formatDuration(recordSeconds) || '0:00'} / {formatDuration(MAX_VOICE_SECONDS)}
          </span>
          <div className="ms-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => stopRecording(true)}>
              <PiXBold className="me-1 h-4 w-4" />
              {t('st_cancel')}
            </Button>
            <Button size="sm" onClick={() => stopRecording(false)}>
              <PiStopFill className="me-1 h-4 w-4" />
              {t('st_record_stop_send')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <textarea
            value={text}
            dir="auto"
            onChange={(e) => {
              setText(e.target.value.slice(0, MAX_TEXT));
              pendingTextId.current = null;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void submitText();
              }
            }}
            placeholder={t('st_reply_placeholder')}
            rows={2}
            disabled={busy}
            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-0"
          />
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <Button
              variant="text"
              size="sm"
              title={t('st_attach_image')}
              disabled={busy}
              onClick={() => imageInput.current?.click()}
            >
              <PiImageBold className="h-5 w-5" />
            </Button>
            <Button
              variant="text"
              size="sm"
              title={t('st_record_voice')}
              disabled={busy}
              onClick={startRecording}
            >
              <PiMicrophoneBold className="h-5 w-5" />
            </Button>
            <Button
              variant="text"
              size="sm"
              title={t('st_upload_voice')}
              disabled={busy}
              onClick={() => voiceInput.current?.click()}
            >
              <PiUploadSimpleBold className="h-5 w-5" />
            </Button>
            <Button
              variant="text"
              size="sm"
              title={t('st_send_location')}
              disabled={busy}
              onClick={() => setLocationOpen(true)}
            >
              <PiMapPinBold className="h-5 w-5" />
            </Button>
            <span className="ms-auto text-xs text-gray-400">
              {text.length}/{MAX_TEXT}
            </span>
            <Button onClick={submitText} disabled={!text.trim() || busy} isLoading={busy}>
              <PiPaperPlaneRightBold className="me-1 h-4 w-4 rtl:rotate-180" />
              {t('st_send')}
            </Button>
          </div>
        </>
      )}

      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void uploadImage(file);
        }}
      />
      <input
        ref={voiceInput}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void uploadVoice(file);
        }}
      />

      <Modal isOpen={locationOpen} onClose={() => setLocationOpen(false)}>
        <div className="space-y-4 p-6">
          <Title as="h3" className="text-lg font-semibold">
            {t('st_send_location')}
          </Title>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('st_latitude')}
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              inputMode="decimal"
              dir="ltr"
            />
            <Input
              label={t('st_longitude')}
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              inputMode="decimal"
              dir="ltr"
            />
          </div>
          <div className="flex justify-between gap-3">
            <Button variant="text" onClick={fillMyLocation}>
              {t('st_use_my_location')}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocationOpen(false)}>
                {t('st_cancel')}
              </Button>
              <Button onClick={submitLocation} isLoading={sendText.isPending}>
                {t('st_send')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
