<?php

namespace App\Filament\Resources\SupportRecords;

use App\Filament\Resources\SupportRecords\Pages\CreateSupportRecord;
use App\Filament\Resources\SupportRecords\Pages\EditSupportRecord;
use App\Filament\Resources\SupportRecords\Pages\ListSupportRecords;
use App\Filament\Resources\SupportRecords\Pages\ViewSupportRecord;
use App\Filament\Resources\SupportRecords\Schemas\SupportRecordForm;
use App\Filament\Resources\SupportRecords\Schemas\SupportRecordInfolist;
use App\Filament\Resources\SupportRecords\Tables\SupportRecordsTable;
use App\Models\SupportRecord;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Closure;
use Illuminate\Database\Eloquent\Model;

class SupportRecordResource extends Resource
{
    protected static ?string $model = SupportRecord::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $navigationLabel = '個人記録';

    protected static ?string $modelLabel = '個人記録';

    protected static ?string $pluralModelLabel = '個人記録';

    public static function form(Schema $schema): Schema
    {
        return SupportRecordForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return SupportRecordInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SupportRecordsTable::configure($table);
    }

    /**
     * Filamentの {record} には単一文字列しか渡せないため、
     * child_id と target_date を結合した値をURLキーとして使う。
     *
     * 例: 123_2026-06-09
     */
    public static function getRecordRouteKeyName(): string
    {
        return 'record_key';
    }

    public static function resolveRecordRouteBinding(int | string $key, ?Closure $modifyQuery = null): ?Model
    {
        $parts = explode('_', (string) $key, 2);

        if (count($parts) !== 2) {
            return null;
        }

        [$childId, $targetDate] = $parts;

        $query = SupportRecord::query()
            ->where('child_id', $childId)
            ->whereDate('target_date', $targetDate);

        if ($modifyQuery) {
            $query = $modifyQuery($query) ?? $query;
        }

        return $query->first();
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSupportRecords::route('/'),
            'create' => CreateSupportRecord::route('/create'),
            'view' => ViewSupportRecord::route('/{record}'),
            'edit' => EditSupportRecord::route('/{record}/edit'),
        ];
    }
}
