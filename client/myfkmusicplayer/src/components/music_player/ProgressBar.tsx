export default function ProgressBar({ current_time, duration }: { current_time: number, duration?: number }) {
    const progress = duration ? (current_time / duration) * 100 : 0;
    return (
        <div className="h-2 w-[30rem] mx-auto rounded-full bg-border/50">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
    );
}