import { Checkbox, Input } from 'rizzui';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useEditSection } from '@/framework/attachments';

function ToggleSection({
  page_id,
  section_id,
  active,
  priority,
  titleEn,
  titleAr,
}: {
  page_id: number;
  section_id: string;
  active: number;
  priority: number;
  titleEn?: string;
  titleAr?: string;
}) {
  const { mutate: update, isPending } = useEditSection();
  const [activation, setActivation] = useState<number>(active);
  const [sectionPeriorty, setSectionPeriorty] = useState<string>(String(priority));

  const [titleEnglish, setTitleEnglish] = useState<string>(titleEn === "Empty" ? "" : titleEn || '');
  const [titleArabic, setTitleArabic] = useState<string>(titleAr === "Empty" ? "" : titleAr || '');
  const [error, setError] = useState<string>('');

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedTitleEnglish = titleEnglish.trim() ? titleEnglish : "Empty";
    const updatedTitleArabic = titleArabic.trim() ? titleArabic : "Empty";


    setError('');
    const title = {
      en: updatedTitleEnglish,
      ar: updatedTitleArabic,
    };

    update({
      section_id,
      page_id,
      active: activation,
      priority: Number(sectionPeriorty),
      title
    });
  };

  return (
    <form onSubmit={onSubmit} className="">
      {(titleEn || titleAr) && (
        <div className="mt-4">
          <div className="w-full">
            <p className="text-sm font-semibold mb-1">Title (EN)</p>
            <Input
              type="text"
              className="col-span-full"
              placeholder="Title in English"
              value={titleEnglish}
              onChange={(e) => setTitleEnglish(e.target.value)}
            />
          </div>
          <div className="w-full mt-4">
            <p className="text-sm font-semibold mb-1">Title (AR)</p>
            <Input
              type="text"
              className="col-span-full"
              placeholder="Title in Arabic"
              value={titleArabic}
              onChange={(e) => setTitleArabic(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}

      <div className="flex w-full flex-col items-start justify-between gap-7 border-b border-gray-200 pb-5 sm:flex-row sm:items-center mt-6">
        {/* <div className="flex items-center justify-around">
          <p className="text-sm font-semibold me-5">Priority</p>
          <Input
            type="number"
            className="col-span-full"
            placeholder="Priority"
            name="priority"
            onChange={(e) => setSectionPeriorty(e.target.value)}
            value={sectionPeriorty}
          />
        </div> */}

        {/* <div className="flex flex-wrap gap-3 px-1">
          <Checkbox
            key={1}
            label={'Active'}
            checked={activation === 1}
            onChange={() => setActivation(activation ? 0 : 1)}
          />
          <Checkbox
            key={0}
            label={'Not Active'}
            checked={activation === 0}
            onChange={() => setActivation(activation ? 0 : 1)}
          />
        </div> */}

        {(titleEn || titleAr) && (
        <Button
          isLoading={isPending}
          type="submit"
          variant="solid"
          className="dark:bg-gray-100 dark:text-white"
        >
          Update
        </Button>
        )}
      </div>
    </form>
  );
}

export default ToggleSection;
