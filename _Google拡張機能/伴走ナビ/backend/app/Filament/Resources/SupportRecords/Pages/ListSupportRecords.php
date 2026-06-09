<?php

namespace App\Filament\Resources\SupportRecords\Pages;

use App\Filament\Resources\SupportRecords\SupportRecordResource;
use App\Models\SupportRecord;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSupportRecords extends ListRecords
{
    protected static string $resource = SupportRecordResource::class;

    public function getTableRecordKey($record): string
    {
        if ($record instanceof SupportRecord) {
            return (string) $record->getRouteKey();
        }

        return (string) $record->getKey();
    }

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
