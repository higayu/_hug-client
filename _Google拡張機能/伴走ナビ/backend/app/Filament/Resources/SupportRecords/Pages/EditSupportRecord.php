<?php

namespace App\Filament\Resources\SupportRecords\Pages;

use App\Filament\Resources\SupportRecords\SupportRecordResource;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Resources\Pages\EditRecord;

class EditSupportRecord extends EditRecord
{
    protected static string $resource = SupportRecordResource::class;

    protected function getHeaderActions(): array
    {
        return [
            ViewAction::make(),
            DeleteAction::make(),
        ];
    }
}
