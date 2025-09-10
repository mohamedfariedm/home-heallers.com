import cn from '@/utils/class-names';

interface FormGroupProps {
  title: React.ReactNode;
  className?: string;
  description?: string;
  children?: React.ReactNode;
}

export default function FormGroup({
  title,
  className,
  description,
  children,
}: FormGroupProps) {
  return (
    <div className={cn(className,'grid gap-2 @3xl:grid-cols-12 pt-0')}>
      <div className="col-span-full @4xl:col-span-4 ">
        <h4 className="text-sm font-semibold ">{title} </h4>
        {description && <p className="mt-2">{description}</p>}
      </div>
      {children && (
        <div className="col-span-full grid gap-4 @2xl:grid-cols-2 @4xl:col-span-8 @4xl:gap-5 xl:gap-7">
          {children}
        </div>
      )}
    </div>
  );
}
