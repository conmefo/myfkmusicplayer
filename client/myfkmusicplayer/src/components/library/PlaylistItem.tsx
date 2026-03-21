import { Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlaylistItemProps {
    name: string;
    imageUrl?: string;
    onClick: () => void;
    onRename?: () => void;
    onDelete?: () => void;
    isDefault?: boolean;
}

export default function PlaylistItem({ name, imageUrl, onClick, onRename, onDelete, isDefault }: PlaylistItemProps) {
    return (
        <div
            className="group flex w-full cursor-pointer items-center rounded-xl border border-border/60 bg-card/80 p-3 transition-colors hover:bg-accent/35"
            onClick={onClick}
        >
            {imageUrl ? (
                <img src={imageUrl} alt={`${name} cover`} className="w-14 h-14 rounded-md flex-shrink-0 object-cover" />
            ) : (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-md bg-muted">
                    <span className="text-xl font-bold text-muted-foreground">{name.charAt(0).toUpperCase()}</span>
                </div>
            )}
            <div className="ml-4 flex min-w-0 flex-grow flex-col justify-center">
                <p className="truncate text-lg font-semibold text-foreground">
                    {name}
                </p>
            </div>

            {!isDefault && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    {onRename && (
                        <Button
                            onClick={(e) => { e.stopPropagation(); onRename(); }}
                            title="Rename Playlist"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <Edit2 className="size-4" />
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Delete Playlist"
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
