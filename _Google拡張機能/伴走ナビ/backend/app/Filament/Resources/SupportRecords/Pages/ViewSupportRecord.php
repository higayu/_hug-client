<?php

namespace App\Filament\Resources\SupportRecords\Pages;

use App\Filament\Resources\SupportRecords\SupportRecordResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewSupportRecord extends ViewRecord
{
    protected static string $resource = SupportRecordResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
}
