'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Title, Text } from '@/components/ui/text';
import toast from 'react-hot-toast';
import client from '@/framework/utils';
import Spinner from '@/components/ui/spinner';
import dynamic from 'next/dynamic';

const QuillEditor = dynamic(() => import('@/components/ui/quill-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[200px] items-center justify-center">
      <Spinner />
    </div>
  ),
});

interface WhatsAppSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
}

const MAX_MESSAGE_LENGTH = 2500;

export default function WhatsAppSendModal({
  isOpen,
  onClose,
  status,
}: WhatsAppSendModalProps) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get plain text from HTML (for character count)
  const getPlainText = (html: string): string => {
    if (!html) return '';
    // Remove HTML tags and decode entities
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const plainText = getPlainText(message);
  const characterCount = plainText.length;
  const isOverLimit = characterCount > MAX_MESSAGE_LENGTH;

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (isOverLimit) {
      toast.error(`Message exceeds ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    setSubmitting(true);
    try {
      await client.customerSupport.sendWhatsApp({
        status,
        message: plainText, // Send plain text to API
      });
      toast.success('WhatsApp message sent successfully');
      setMessage('');
      onClose();
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to send WhatsApp message'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="m-auto w-full max-w-2xl rounded-lg bg-white p-6">
        <Title as="h3" className="mb-4 text-lg font-semibold">
          Send WhatsApp Message - {status.charAt(0).toUpperCase() + status.slice(1)}
        </Title>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Message <span className="text-red-500">*</span>
            </label>
            <div className="rounded-lg border border-gray-300">
              <QuillEditor
                value={message}
                onChange={setMessage}
                placeholder="Type your message here..."
                className="min-h-[200px]"
                showCharCount={false}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Text className="text-xs text-gray-500">
                You can format your message with bold, italic, lists, etc.
              </Text>
              <Text
                className={`text-xs font-medium ${
                  isOverLimit ? 'text-red-500' : 'text-gray-500'
                }`}
              >
                {characterCount} / {MAX_MESSAGE_LENGTH} characters
              </Text>
            </div>
            {isOverLimit && (
              <Text className="mt-1 text-xs text-red-500">
                Message exceeds the maximum length of {MAX_MESSAGE_LENGTH} characters
              </Text>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !message.trim() || isOverLimit}
              isLoading={submitting}
            >
              Send WhatsApp Message
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
