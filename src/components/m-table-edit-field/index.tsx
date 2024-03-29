import React, { Component } from 'react';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import DateTimePicker from '@mui/lab/DateTimePicker';
import TimePicker from '@mui/lab/TimePicker';
import { MTableEditFieldProps } from './models';
import omit from 'lodash/omit';

export default class MTableEditField extends Component<MTableEditFieldProps> {
    getProps() {
        return omit(this.props, 'columnDef', 'rowData', 'onRowDataChange');
    }

    renderLookupField() {
        const lookup = this.props.columnDef.lookup ?? {};
        return (
            <Select
                {...this.getProps()}
                variant='standard'
                value={this.props.value === undefined ? '' : this.props.value}
                onChange={event => this.props.onChange(event.target.value)}
                style={{
                    fontSize: 13,
                }}
            >
                {Object.keys(lookup).map(key => (
                    <MenuItem key={key} value={key}>
                        {lookup[key]}
                    </MenuItem>)
                )}
            </Select>
        );

    }

    renderBooleanField() {
        return (
            <Checkbox
                {...this.getProps()}
                value={String(this.props.value)}
                checked={Boolean(this.props.value)}
                onChange={event => this.props.onChange(event.target.checked)}
                style={{
                    paddingLeft: 0,
                    paddingTop: 0,
                    paddingBottom: 0
                }}
            />
        );
    }

    renderDateField() {
        return (
            <LocalizationProvider dateAdapter={AdapterDateFns as any}>
                <DatePicker
                    {...this.getProps()}
                    inputFormat='dd.MM.yyyy'
                    value={this.props.value || null}
                    onChange={this.props.onChange}
                    renderInput={(params) => (
                        <TextField
                            variant='standard'
                            {...params}
                        />
                    )}
                    clearable
                    InputProps={{
                        style: {
                            fontSize: 13,
                        }
                    }}
                />
            </LocalizationProvider>
        );
    }

    renderTimeField() {
        return (
            <LocalizationProvider dateAdapter={AdapterDateFns as any}>
                <TimePicker
                    {...this.getProps()}
                    inputFormat='HH:mm:ss'
                    value={this.props.value || null}
                    onChange={this.props.onChange}
                    renderInput={(params) => (
                        <TextField
                            variant='standard'
                            {...params}
                        />
                    )}
                    clearable
                    InputProps={{
                        style: {
                            fontSize: 13,
                        }
                    }}
                />
            </LocalizationProvider>
        );
    }

    renderDateTimeField() {
        return (
            <LocalizationProvider dateAdapter={AdapterDateFns as any}>
                <DateTimePicker
                    {...this.getProps()}
                    inputFormat='dd.MM.yyyy HH:mm:ss'
                    value={this.props.value || null}
                    onChange={this.props.onChange}
                    renderInput={(params) => (
                        <TextField
                            variant='standard'
                            {...params}
                        />
                    )}
                    clearable
                    InputProps={{
                        style: {
                            fontSize: 13,
                        }
                    }}
                />
            </LocalizationProvider>
        );
    }

    renderTextField() {
        const placeholder = typeof this.props.columnDef.title === 'string' ? this.props.columnDef.title : undefined;
        return (
            <TextField
                {...this.getProps()}
                variant='standard'
                style={this.props.columnDef.type === 'numeric' ? { float: 'right' } : {}}
                type={this.props.columnDef.type === 'numeric' ? 'number' : 'text'}
                placeholder={placeholder}
                value={this.props.value === undefined ? '' : this.props.value}
                onChange={event => this.props.onChange(event.target.value)}
                InputProps={{
                    style: {
                        fontSize: 13,
                    },
                }}
            />
        );
    }

    renderCurrencyField() {
        return 'ok';
    }

    render() {
        if (this.props.columnDef.lookup) {
            return this.renderLookupField();
        }
        else if (this.props.columnDef.type === 'boolean') {
            return this.renderBooleanField();
        }
        else if (this.props.columnDef.type === 'date') {
            return this.renderDateField();
        }
        else if (this.props.columnDef.type === 'time') {
            return this.renderTimeField();
        }
        else if (this.props.columnDef.type === 'datetime') {
            return this.renderDateTimeField();
        }
        else if (this.props.columnDef.type === 'currency') {
            return this.renderCurrencyField();
        }
        else {
            return this.renderTextField();
        }
    }
}
