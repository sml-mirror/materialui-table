import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import Checkbox from '@mui/material/Checkbox';
import { Draggable } from 'react-beautiful-dnd';
import { StyleRules, withStyles } from '@mui/styles';
import { MTableHeaderProps } from './model';
import { Theme } from '@mui/material';

const defaultCellScope = 'col';

class MTableHeader extends Component<MTableHeaderProps> {

    static defaultProps: Partial<MTableHeaderProps> = {
        dataCount: 0,
        hasSelection: false,
        headerClassName: '',
        headerStyle: {},
        selectedCount: 0,
        sorting: true,
        localization: {
            actions: 'Actions'
        },
        orderBy: undefined,
        orderDirection: 'asc',
        actionsHeaderIndex: 0,
        detailPanelColumnAlignment: 'left'
    }

    rootHeaders = {};
    rootClassNames = {};

    getCellClassName(index: number) {
        const cellClassName = `${this.props.headerClassName || ''} ${this.props.classes.header}${(index < this.props.fixedColumns ? ' cell-fixed' : '')}`;
        return cellClassName;
    }

    renderHeader() {
        const mapArr = this.props.columns
            .filter((columnDef) => !columnDef.hidden && !(columnDef.tableData.groupOrder > -1))
            .sort((a, b) => a.tableData.columnOrder - b.tableData.columnOrder)
            .map((columnDef, index) => {
                let content = (
                    <Draggable
                        key={columnDef.tableData.id}
                        isDragDisabled={!this.props.draggableHeader || index < this.props.fixedColumns}
                        draggableId={columnDef.tableData.id.toString()}
                        index={index}>
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                // style={this.getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                            >
                                {columnDef.title}
                            </div>
                        )}
                    </Draggable>
                );

                // if (this.props.grouping && columnDef.grouping !== false && columnDef.field) {
                //   content = (
                //     <Draggable
                //       key={columnDef.tableData.id}
                //       draggableId={columnDef.tableData.id.toString()}
                //       index={index}>
                //       {(provided, snapshot) => (
                //         <div
                //           ref={provided.innerRef}
                //           {...provided.draggableProps}
                //           {...provided.dragHandleProps}
                //         // style={this.getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                //         >
                //           {columnDef.title}
                //         </div>
                //       )}
                //     </Draggable>
                //   );
                // }

                if (columnDef.sorting !== false && this.props.sorting) {
                    content = (
                        <TableSortLabel
                            active={this.props.orderBy === columnDef.tableData.id}
                            direction={this.props.orderDirection || 'asc'}
                            IconComponent={this.props.headerSortIcon}
                            onClick={() => {
                                const orderDirection = columnDef.tableData.id !== this.props.orderBy ? 'asc' : this.props.orderDirection === 'asc' ? 'desc' : 'asc';
                                this.props.onOrderChange(columnDef.tableData.id, orderDirection);
                            }}
                        >
                            {content}
                        </TableSortLabel>
                    );
                }

                if (this.props.filtering && this.props.filterType === 'header') {
                    content = (
                        <>
                            {content}
                            <this.props.components.FilterButton
                                localization={this.props.localization}
                                icons={this.props.icons}
                                columnDef={columnDef}
                                onFilterChanged={this.props.onFilterChanged}
                            />
                        </>
                    );
                }

                const cellClassName = `${this.getCellClassName(index)} ${columnDef.cellClassName || ''}`;

                let rootTitle = null;
                if (columnDef.rootTitle) {
                    if (typeof columnDef.rootTitle === 'string') {
                        rootTitle = columnDef.rootTitle;
                    }
                    rootTitle = ReactDOMServer.renderToStaticMarkup(columnDef.rootTitle as any).replace(/<[^>]+>/g, '');
                    this.rootHeaders[rootTitle] = columnDef.rootTitle;
                    this.rootClassNames[rootTitle] = cellClassName;
                }
                const scope = rootTitle || defaultCellScope;

                return (
                    <TableCell
                        key={columnDef.tableData.id}
                        align={['numeric'].indexOf(columnDef.type) !== -1 ? 'right' : 'left'}
                        className={cellClassName}
                        style={{ ...this.props.headerStyle, ...columnDef.headerStyle }}
                        scope={scope}
                    >
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>{content}</span>
                    </TableCell>
                );
            });
        return mapArr;
    }

    renderActionsHeader() {
        const localization = { ...MTableHeader.defaultProps.localization, ...this.props.localization };
        const cellClassName = `${this.props.headerClassName || ''} ${this.props.classes.header}${(this.props.actionsHeaderIndex !== -1 && this.props.actionsHeaderIndex < this.props.fixedColumns ? ' cell-fixed' : '')}`;

        return (
            <TableCell
                key='key-actions-column'
                padding='checkbox'
                className={cellClassName}
                style={{ ...this.props.headerStyle, textAlign: 'center' }}
                scope={defaultCellScope}
            >
                <TableSortLabel disabled>{localization.actions}</TableSortLabel>
            </TableCell>
        );
    }

    renderSelectionHeader() {
        const cellClassName = this.getCellClassName(0);

        return (
            <TableCell
                padding='none'
                key='key-selection-column'
                className={cellClassName}
                style={{ ...this.props.headerStyle }}
                scope={defaultCellScope}
            >
                {this.props.showSelectAllCheckbox &&
            <Checkbox
                indeterminate={this.props.selectedCount > 0 && this.props.selectedCount < this.props.dataCount}
                checked={this.props.dataCount > 0 && this.props.selectedCount === this.props.dataCount}
                onChange={(event, checked) => this.props.onAllSelected && this.props.onAllSelected(checked)}
            />
                }
            </TableCell>
        );
    }

    renderDetailPanelColumnCell() {
        const cellClassName = `${this.props.headerClassName || ''} ${this.props.classes.header}${(this.props.detailPanelColumnAlignment === 'left' ? ' cell-fixed' : '')}`;

        return (
            <TableCell
                padding='none'
                key='key-detail-panel-column'
                className={cellClassName}
                style={{ ...this.props.headerStyle }}
                scope={defaultCellScope}
            />
        );
    }

    render() {
        let rooltLevelCellFixedAddon = 0;
        const cellClassName = `${this.props.headerClassName || ''} ${this.props.classes.header}${(this.props.fixedColumns ? ' cell-fixed' : '')}`;
        // const cellClassName = `${this.getCellClassName(index)} ${columnDef.cellClassName || ''}`;
        // const rootCellClassName = `${this.props.headerClassName || ''} ${this.props.classes.header}`;
        const headers = this.renderHeader();
        if (this.props.hasSelection) {
            headers.splice(0, 0, this.renderSelectionHeader());
            ++rooltLevelCellFixedAddon;
        }

        if (this.props.showActionsColumn) {
            if (this.props.actionsHeaderIndex >= 0) {
                let endPos = 0;
                if (this.props.hasSelection) {
                    endPos = 1;
                }
                headers.splice(this.props.actionsHeaderIndex + endPos, 0, this.renderActionsHeader());
            } else if (this.props.actionsHeaderIndex === -1) {
                headers.push(this.renderActionsHeader());
            }
            ++rooltLevelCellFixedAddon;
        }

        if (this.props.hasDetailPanel) {
            if (this.props.detailPanelColumnAlignment === 'right') {
                headers.push(this.renderDetailPanelColumnCell());
            }
            else {
                headers.splice(0, 0, this.renderDetailPanelColumnCell());
            }
            ++rooltLevelCellFixedAddon;
        }

        if (this.props.isTreeData) {
            headers.splice(0, 0,
                <TableCell
                    padding='none'
                    key={'key-tree-data-header'}
                    className={cellClassName}
                    style={{ ...this.props.headerStyle }}
                    scope={defaultCellScope}
                />
            );
            ++rooltLevelCellFixedAddon;
        }

        this.props.columns
            .filter((columnDef) => columnDef.tableData.groupOrder > -1)
            .forEach((columnDef) => {
                headers.splice(0, 0, <TableCell padding='checkbox' key={'key-group-header' + columnDef.tableData.id} className={cellClassName} scope={defaultCellScope} />);
            });

        let rootHeaders: any[] = [];

        let headerColumnIndex = 0;
        let currentTitle = '';
        const topLevelHeaders = headers.reduce((state: any, item: any, index: number) => {
            const title = item.props.scope;
            if (title !== currentTitle || (this.props.fixedColumns && (this.props.fixedColumns + rooltLevelCellFixedAddon) === index)) {
                currentTitle = title;
                if (index > 0) {
                    ++headerColumnIndex;
                }
            }
            const key = `${headerColumnIndex}_${currentTitle}`;
            state[key] = state[key] ? state[key] + 1 : 1;
            return state;
        }, {});

        const topLevelHeaderKeys = Object.keys(topLevelHeaders);
        const rootHeadersKeys = Object.keys(this.rootHeaders);
        if (topLevelHeaderKeys.length > 1) {
            rootHeaders = topLevelHeaderKeys.map((topLevelHeader, index) => {
                let name = topLevelHeader.split('_')[1];
                if (name === defaultCellScope) {
                    name = '';
                }
                return (
                    <TableCell
                        align='center'
                        key={topLevelHeader}
                        style={{ ...this.props.headerStyle }}
                        className={`root-header-cell ${ name === '' ? `${this.props.classes.header}` : `${this.rootClassNames[name]}`}${(this.props.fixedColumns && !index ? ' cell-fixed' : '')}`}
                        colSpan={topLevelHeaders[topLevelHeader]}
                    >
                        { name === '' ? '' : this.rootHeaders[name]}
                    </TableCell>
                );
            });
        }
        return (
            <TableHead>
                {rootHeadersKeys.length > 0 &&
                    <TableRow>
                        {rootHeaders}
                    </TableRow>
                }
                <TableRow>
                    {headers}
                </TableRow>
            </TableHead>
        );
    }
}

// TODO: online fix style for top like a material-table ScrollBar
export const styles = (theme: Theme): StyleRules => ({
    header: {
        position: 'sticky',
        top: 0,
        zIndex: 10,
        '& > span .empty-header-filter-button': {
            // display: 'none'
            color: 'transparent'
        },
        '&': {
            // display: 'none'
            backgroundColor: theme.palette.background.paper, // Change according to theme,
        },
        '&.is-dragged': {
            // display: 'none'
            backgroundColor: 'transparent!important',
        },
        '& > span:hover .empty-header-filter-button': {
            // display: 'block'
            color: 'inherit'
        }
    }
});

export default withStyles(styles)(MTableHeader);
