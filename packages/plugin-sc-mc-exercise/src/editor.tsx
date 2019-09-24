import { useScopedSelector } from '@edtr-io/core'
import {
  Icon,
  faPlus,
  faTimes,
  styled,
  PreviewOverlay
} from '@edtr-io/editor-ui'
import { StatefulPluginEditorProps } from '@edtr-io/plugin'
import { getFocused, isEmpty as isEmptySelector } from '@edtr-io/store'
import * as R from 'ramda'
import * as React from 'react'

import { scMcExerciseState } from '.'
import { SCMCInput } from './button'
import { ScMcExerciseRenderer } from './renderer'

const AnswerContainer = styled.div({
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center'
})

const CheckboxContainer = styled.div({
  width: '10%',
  textAlign: 'center',
  marginRight: '10px',
  fontWeight: 'bold'
})

const FramedContainer = styled.div<{ focused: boolean }>(({ focused }) => {
  return {
    width: '100%',
    marginLeft: '10px',
    borderRadius: '10px',
    border: focused ? '3px solid #003399' : '2px solid lightgrey'
  }
})
const RemoveButton = styled.button<{ focused: boolean }>(({ focused }) => {
  return {
    borderRadius: '50%',
    outline: 'none',
    background: 'white',
    color: focused ? ' #003399' : 'lightgrey',
    border: focused ? '3px solid #003399' : '2px solid lightgrey',
    zIndex: 20,
    float: 'right',
    transform: 'translate(50%, -40%)',
    '&:hover': {
      border: '3px solid #003399',
      color: '#003399'
    }
  }
})
const AnswerField = styled.div({ paddingLeft: '20px', paddingTop: '10px' })

const FeedbackField = styled.div({
  paddingLeft: '20px',
  paddingBottom: '10px',
  paddingTop: '10px',
  marginTop: '5px',
  borderTop: '2px solid lightgrey'
})

const AddButton = styled.button({
  marginLeft: 'calc(10% + 20px)',
  width: 'calc(90% - 20px)',
  borderRadius: '10px',
  backgroundColor: 'white',
  textAlign: 'left',
  color: 'lightgrey',
  minHeight: '50px',
  border: '2px solid lightgrey',
  outline: 'none',
  '&:hover': { border: '3px solid #003399', color: '#003399' }
})

export function ScMcExerciseEditor(
  props: StatefulPluginEditorProps<typeof scMcExerciseState> & {
    renderIntoExtendedSettings?: (children: React.ReactNode) => React.ReactNode
  }
) {
  const focusedElement = useScopedSelector(getFocused())
  const isEmpty = useScopedSelector(state => (id: string) =>
    isEmptySelector(id)(state)
  )
  const { editable, focused, state } = props
  const children = R.flatten<string>(
    props.state.answers.map(answer => {
      return [answer.id.id, answer.feedback.id]
    })
  )
  const handleCheckboxChange = (index: number) => () => {
    const { state } = props
    state.answers[index].isCorrect.set(currentVal => !currentVal)
  }

  const handleRadioButtonChange = (rightanswerIndex: number) => () => {
    const { state } = props
    state.answers.forEach((answer, index) => {
      answer.isCorrect.set(index === rightanswerIndex)
    })
  }

  const handleSCMCChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { state } = props

    state.isSingleChoice.set(event.target.value === 'Single Choice')
    state.isSingleChoice.value &&
      state.answers.forEach(answer => {
        answer.isCorrect.set(false)
      })
  }

  const addButton = () => {
    const { state } = props

    state.answers.insert()
  }

  const removeAnswer = (index: number) => () => {
    const { state } = props
    state.answers.remove(index)
  }

  const nestedFocus = focused || R.contains(focusedElement, children)
  const [previewActive, setPreviewActive] = React.useState(false)

  if (!editable) {
    return <ScMcExerciseRenderer {...props} isEmpty={isEmpty} />
  }

  const Controls = (
    <React.Fragment>
      Select the exercise type:
      <select
        value={state.isSingleChoice.value ? 'Single Choice' : 'Multiple Choice'}
        onChange={handleSCMCChange}
      >
        <option value="Multiple Choice">Multiple Choice</option>
        <option value="Single Choice">Single Choice</option>
      </select>
    </React.Fragment>
  )

  return (
    <React.Fragment>
      <PreviewOverlay
        focused={nestedFocus || false}
        onChange={setPreviewActive}
        editable={previewActive}
      >
        <ScMcExerciseRenderer {...props} isEmpty={isEmpty} />
      </PreviewOverlay>
      {editable ? (
        <div>
          {props.renderIntoExtendedSettings ? (
            props.renderIntoExtendedSettings(Controls)
          ) : (
            <React.Fragment>
              <hr />
              {Controls}
            </React.Fragment>
          )}

          {nestedFocus && !previewActive ? (
            <React.Fragment>
              {state.answers.map((answer, index) => {
                return (
                  <AnswerContainer key={index}>
                    <CheckboxContainer>
                      Richtig?
                      <SCMCInput
                        isSingleChoice={state.isSingleChoice.value}
                        isActive={answer.isCorrect.value}
                        handleChange={
                          state.isSingleChoice.value
                            ? handleRadioButtonChange(index)
                            : handleCheckboxChange(index)
                        }
                      />
                    </CheckboxContainer>
                    {/* TODO: Change Placeholder to "Antwort" und "Feedback", Dependency Plugin Config */}
                    <FramedContainer
                      focused={
                        answer.id.id === focusedElement ||
                        answer.feedback.id === focusedElement
                      }
                    >
                      <AnswerField>{answer.id.render()}</AnswerField>
                      <RemoveButton
                        focused={
                          answer.id.id === focusedElement ||
                          answer.feedback.id === focusedElement
                        }
                        onClick={removeAnswer(index)}
                      >
                        <Icon icon={faTimes} />
                      </RemoveButton>
                      <FeedbackField>{answer.feedback.render()}</FeedbackField>
                    </FramedContainer>
                  </AnswerContainer>
                )
              })}
              <AddButton onClick={addButton}>
                <Icon icon={faPlus} /> Antwort hinzufügen ...
              </AddButton>
            </React.Fragment>
          ) : null}
        </div>
      ) : null}
    </React.Fragment>
  )
}
