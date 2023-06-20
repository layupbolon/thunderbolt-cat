import DeleteIcon from '../icons/delete.svg';
import styles from './home.module.scss';
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from '@hello-pangea/dnd';

import { GPTModel, useChatStore } from '../store';

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  model: GPTModel;
  midjourney: boolean;
  count: number;
  time: string;
  selected: boolean;
  id: number;
  index: number;
}) {
  return (
    <Draggable draggableId={`${props.id}`} index={props.index}>
      {(provided) => (
        <div
          className={`${styles['chat-item']} ${
            props.selected && styles['chat-item-selected']
          }`}
          onClick={props.onClick}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {props.model === GPTModel.GPT4 && (
            <div className={styles['chat-model']}>{props.model}</div>
          )}
          {props.midjourney && <div className={styles['chat-model']}>AI绘画</div>}
          <div className={styles['chat-item-title']}>{props.title}</div>
          <div className={styles['chat-item-info']}>
            <div className={styles['chat-item-count']}>{`${props.count} 条对话`}</div>
            <div className={styles['chat-item-date']}>{props.time}</div>
          </div>
          <div
            className={styles['chat-item-delete']}
            onClick={() => {
              props.onClick?.();
              setTimeout(() => {
                props.onDelete?.();
              }, 500);
            }}
          >
            <DeleteIcon />
          </div>
        </div>
      )}
    </Draggable>
  );
}

export function ChatList() {
  const [sessions, selectedIndex, selectSession, deleteSession, moveSession] =
    useChatStore((state) => [
      state.sessions,
      state.currentSessionIndex,
      state.selectSession,
      state.deleteSession,
      state.moveSession,
    ]);

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveSession(source.index, destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chat-list">
        {(provided) => (
          <div
            className={styles['chat-list']}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {sessions.map((item, i) => (
              <ChatItem
                title={item.topic}
                model={item.gptModel}
                midjourney={!!item.midjourney}
                time={item.lastUpdate}
                count={item.messages.length}
                key={item.id}
                id={item.id}
                index={i}
                selected={i === selectedIndex}
                onClick={() => selectSession(i)}
                onDelete={deleteSession}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
