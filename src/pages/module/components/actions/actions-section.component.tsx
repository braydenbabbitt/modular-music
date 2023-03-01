import { Button, Divider, Text, Stack, Title, useMantineTheme } from '@mantine/core';
import { IconChevronDown, IconPlus } from '@tabler/icons';
import { DeepPartial, useTypedJSONEncoding } from 'den-ui';
import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { useSupabase } from '../../../../services/supabase/client/client';
import {
  ActionType,
  addActionToModule,
  deleteActionFromModule,
  getActionSources,
  getActionType,
  updateActionOrder,
} from '../../../../services/supabase/modules/actions.api';
import { FetchedModuleAction } from '../../../../services/supabase/modules/modules.api';
import { ActionItem } from './action-item.component';
import { ActionFormValues, ActionSelectionOnSubmitArgs, ActionSelectorModal } from './action-selector-modal.component';

type ActionsSectionsProps = {
  actions: FetchedModuleAction[];
  refetchActions: () => void;
  moduleId: string;
  hideTitle?: boolean;
  disableEditing?: boolean;
};

export const ActionsSection = ({
  actions,
  refetchActions,
  moduleId,
  hideTitle,
  disableEditing,
}: ActionsSectionsProps) => {
  const supabaseClient = useSupabase();
  const mantineTheme = useMantineTheme();
  const { parseTypedJSON: parseActionType, stringifyTypedJSON: stringifyActionType } =
    useTypedJSONEncoding<ActionType>();
  const [selectedActionId, setSelectedActionId] = useState<string>();
  const [actionSelectorModalInitValues, setActionSelectorModalInitValues] = useState<Partial<ActionFormValues>>();
  const [actionSelectorModalIsOpen, setActionSelectorModalIsOpen] = useState(false);
  const [actionsList, setActionsList] = useState(actions);
  const [isDragging, setIsDragging] = useState(false);

  const handleOnDragEnd = (result: DropResult) => {
    setIsDragging(false);
    if (result.destination) {
      const actionsItems = [...actionsList];
      const [reorderedItem] = actionsItems.splice(result.source.index, 1);
      actionsItems.splice(result.destination.index, 0, reorderedItem);
      setActionsList(actionsItems);
      actionsItems.forEach((action, index) => {
        updateActionOrder({ supabaseClient, actionId: action.id, order: index });
      });
      refetchActions();
    }
  };

  useEffect(() => {
    setActionsList(actions);
  }, [actions]);

  return (
    <section css={{ marginTop: mantineTheme.spacing.md }}>
      {!hideTitle && <Title order={3}>Actions:</Title>}
      <Stack spacing={0}>
        <DragDropContext
          onDragStart={() => {
            setIsDragging(true);
          }}
          onDragEnd={handleOnDragEnd}
        >
          <Droppable droppableId='actions'>
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                css={{ listStyle: 'none', padding: 0, margin: 0 }}
              >
                {actionsList.map((action, index) => (
                  <React.Fragment key={action.id}>
                    <Draggable key={action.id} draggableId={action.id} index={index} isDragDisabled={disableEditing}>
                      {(provided) => (
                        <ActionItem
                          key={action.id}
                          imageHref={action.image_href}
                          label={action.label}
                          actionId={action.id}
                          provided={provided}
                          handleEdit={() => {
                            setSelectedActionId(action.id);
                            getActionType({ supabaseClient, typeId: action.type_id }).then((actionType) => {
                              getActionSources({ supabaseClient, actionId: action.id }).then((actionSources) => {
                                console.log({ actionSources });
                                if (actionType) {
                                  setActionSelectorModalInitValues({
                                    actionType: stringifyActionType(actionType),
                                    filterSources: actionSources,
                                  });
                                }
                                setActionSelectorModalIsOpen(true);
                              });
                            });
                          }}
                          handleDelete={() =>
                            deleteActionFromModule({ supabaseClient, actionId: action.id }).then(() => refetchActions())
                          }
                          typeId={action.type_id}
                          disabled={disableEditing}
                        />
                      )}
                    </Draggable>
                  </React.Fragment>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
        {!isDragging && (
          <Button
            variant='subtle'
            leftIcon={<IconPlus />}
            size='md'
            css={[
              { margin: `${mantineTheme.spacing.sm}px 0` },
              disableEditing ? { opacity: 0.5, cursor: 'default', ':hover': { backgroundColor: 'transparent' } } : {},
            ]}
            onClick={disableEditing ? undefined : () => setActionSelectorModalIsOpen(true)}
          >
            Add Action
          </Button>
        )}
      </Stack>
      <ActionSelectorModal
        initValues={actionSelectorModalInitValues}
        open={actionSelectorModalIsOpen}
        actionId={selectedActionId}
        refetchActions={refetchActions}
        onClose={() => {
          setActionSelectorModalIsOpen(false);
          setSelectedActionId(undefined);
          setActionSelectorModalInitValues(undefined);
        }}
        onConfirm={({ values, label, image_href, sources }: ActionSelectionOnSubmitArgs) => {
          const actionType = parseActionType(values.actionType);
          if (moduleId && actionType) {
            addActionToModule({
              supabaseClient,
              sources,
              module_id: moduleId,
              type_id: actionType.id,
              label,
              image_href,
              order: actions.length,
            }).then(() => {
              refetchActions();
            });
          }
        }}
      />
    </section>
  );
};
