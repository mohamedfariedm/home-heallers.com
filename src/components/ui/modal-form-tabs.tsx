'use client';

import React from 'react';
import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import cn from '@/utils/class-names';

export type ModalFormTabItem = {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  hasError?: boolean;
};

/** Outer form class: fixed modal height, header/tabs/footer stay put */
export const modalFormTabsClassName =
  'flex h-[85vh] max-h-[85vh] flex-col overflow-hidden';

export function ModalFormTabPanelCard({
  title,
  description,
  children,
  className,
  contentClassName,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-300 dark:bg-gray-100/40',
        className
      )}
    >
      <div className="mb-4 border-b border-gray-200 pb-3 dark:border-gray-300">
        <h5 className="text-sm font-semibold text-gray-900">{title}</h5>
        {description ? (
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        ) : null}
      </div>
      <div className={cn('grid gap-4 sm:grid-cols-2', contentClassName)}>
        {children}
      </div>
    </div>
  );
}

type ModalFormTabsProps = {
  tabs: ModalFormTabItem[];
  activeTab: number;
  onTabChange: (index: number) => void;
  children: React.ReactNode;
  className?: string;
};

/** Tab strip + scrollable panel area. Pass TabPanel children via TabPanels children. */
export function ModalFormTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
}: ModalFormTabsProps) {
  return (
    <Tabs
      selectedIndex={activeTab}
      onChange={onTabChange}
      className={cn('flex min-h-0 flex-1 flex-col', className)}
    >
      <div className="shrink-0 border-b border-gray-200 bg-white px-6">
        <TabList className="inline-flex w-full justify-start gap-1 overflow-x-auto border-0 p-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Tab
                key={tab.id}
                className={({ selected }: { selected: boolean }) =>
                  cn(
                    'relative flex shrink-0 items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium outline-none transition-all',
                    selected
                      ? 'border-b-2 border-[#143087] bg-blue-50/60 text-[#143087]'
                      : 'text-gray-600 hover:bg-blue-50/40 hover:text-[#143087]'
                  )
                }
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {tab.label}
                {tab.hasError ? (
                  <span className="absolute right-1 top-2 h-2 w-2 rounded-full bg-red-500" />
                ) : null}
              </Tab>
            );
          })}
        </TabList>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <TabPanels>{children}</TabPanels>
      </div>
    </Tabs>
  );
}

export function ModalFormTabPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabPanel unmount={false} className={cn('outline-none', className)}>
      {children}
    </TabPanel>
  );
}

type ModalFormTabsFooterProps = {
  activeTab: number;
  tabCount: number;
  onPrev: () => void;
  onNext: () => void;
  submitLabel: React.ReactNode;
  cancelLabel?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  onCancel?: () => void;
};

export function ModalFormTabsFooter({
  activeTab,
  tabCount,
  onPrev,
  onNext,
  submitLabel,
  cancelLabel = 'Cancel',
  isLoading,
  disabled,
  onCancel,
}: ModalFormTabsFooterProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50/80 px-6 py-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={activeTab === 0}
          onClick={onPrev}
          className="border-gray-200 hover:border-[#143087]/40 hover:text-[#143087]"
        >
          <PiCaretLeft className="me-1 h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={activeTab === tabCount - 1}
          onClick={onNext}
          className="border-gray-200 hover:border-[#143087]/40 hover:text-[#143087]"
        >
          Next
          <PiCaretRight className="ms-1 h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-3">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-200 hover:border-[#143087]/40 hover:text-[#143087]"
          >
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          type="submit"
          isLoading={isLoading}
          disabled={disabled}
          className="bg-[#143087] hover:bg-[#0F2466]"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
