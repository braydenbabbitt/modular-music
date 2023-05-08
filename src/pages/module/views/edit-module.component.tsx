import { QueryObserverResult } from 'react-query';
import { GetModuleDataResponse } from '../../../services/supabase/modules/modules.api';
import { ActionsSection } from '../components/actions/actions-section.component';
import { OutputSection } from '../components/output/output-section.component';
import { SourceSection } from '../components/sources/sources-section.component';

type EditModuleProps = {
  moduleData: GetModuleDataResponse;
  refetchModuleData: () => void;
  disableEditing?: boolean;
  userPlaylists: any[];
  refetchUserPlaylists: () => Promise<QueryObserverResult<any[], unknown>>;
};

export const EditModule = ({
  moduleData,
  refetchModuleData,
  disableEditing,
  userPlaylists,
  refetchUserPlaylists,
}: EditModuleProps) => {
  return (
    <>
      <SourceSection
        sources={moduleData.sources}
        refetchSources={refetchModuleData}
        moduleId={moduleData.id}
        disableEditing={disableEditing}
      />
      <ActionsSection
        actions={moduleData.actions}
        refetchActions={refetchModuleData}
        moduleId={moduleData.id}
        disableEditing={disableEditing}
      />
      <OutputSection
        output={moduleData.output}
        refetchOutput={refetchModuleData}
        moduleId={moduleData.id}
        disableEditing={disableEditing}
        userPlaylists={userPlaylists}
        refetchUserPlaylists={refetchUserPlaylists}
      />
    </>
  );
};
