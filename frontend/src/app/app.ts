import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Apollo, gql } from 'apollo-angular';
import { FormsModule } from '@angular/forms';

const GET_TAKS = gql`
  query {
    tasks {
      id, title, description, dueDate, order
      column { id name }
    }
    boards {
      id, columns { id name }
    }
  }
`;

const CREATE_TASK = gql`
  mutation($input: CreateTaskInput!) {
    createTask(input: $input) { id title }
  }
`;

const MOVE_TASK = gql`
  mutation($input: MoveTaskInput!) {
    moveTask(input: $input) { id }
  }
`;

const DELETE_TASK = gql`
  mutation($id: String!) {
    deleteTask(id: $id)
  }
`;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  todo: any[] = [];
  doing: any[] = [];
  done: any[] = [];

  // --- NOVAS VARIÁVEIS DO DASHBOARD ---
  totalTasks = 0;
  progress = 0; // % de conclusão
  atrasadas = 0;
  // ------------------------------------

  colunasIds: any = {}; 
  selecionado: any = null;

  novoTitulo = '';
  novaDescricao = '';
  novoPrazo = '';

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.carregarDados();
    const hoje = new Date().toISOString().split('T')[0];
    this.novoPrazo = hoje;
  }

  carregarDados() {
    this.apollo
      .watchQuery({ query: GET_TAKS, fetchPolicy: 'network-only' })
      .valueChanges.subscribe((result: any) => {
        const tasksRaw = result.data?.tasks || [];
        const boards = result.data?.boards || [];

        if (boards.length > 0 && boards[0].columns) {
            boards[0].columns.forEach((col: any) => {
                this.colunasIds[col.name] = col.id;
            });
        }

        const allTasks = tasksRaw.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          dueDate: t.dueDate,
          columnId: t.column?.id,
          columnName: t.column?.name
        }));

        this.todo = allTasks.filter((t: any) => t.columnName === 'A Fazer' || t.columnName === 'TODO');
        this.doing = allTasks.filter((t: any) => t.columnName === 'Em Progresso' || t.columnName === 'DOING');
        this.done = allTasks.filter((t: any) => t.columnName === 'Feito' || t.columnName === 'DONE');

        // CALCULA O DASHBOARD SEMPRE QUE OS DADOS CHEGAM
        this.atualizarEstatisticas();
      });
  }

  atualizarEstatisticas() {
    this.totalTasks = this.todo.length + this.doing.length + this.done.length;
    
    // Cálculo de Progresso (Tarefas Feitas / Total)
    if (this.totalTasks > 0) {
      this.progress = Math.round((this.done.length / this.totalTasks) * 100);
    } else {
      this.progress = 0;
    }

    // Cálculo de Atrasadas
    const hoje = new Date().toISOString().split('T')[0];
    const todas = [...this.todo, ...this.doing]; // Só conta atraso se não estiver "Feito"
    
    this.atrasadas = todas.filter(t => t.dueDate && t.dueDate < hoje).length;
  }

  adicionar() {
    if (!this.novoTitulo.trim()) return;

    let idColuna = this.colunasIds['A Fazer'] || this.colunasIds['TODO'];
    
    if (!idColuna && Object.values(this.colunasIds).length > 0) {
        idColuna = Object.values(this.colunasIds)[0];
    }

    const input = {
      title: this.novoTitulo,
      description: this.novaDescricao,
      dueDate: this.novoPrazo || null,
      order: 0,
      columnId: idColuna
    };

    this.apollo.mutate({
        mutation: CREATE_TASK,
        variables: { input },
        refetchQueries: [{ query: GET_TAKS }],
      }).subscribe(() => {
        this.novoTitulo = '';
        this.novaDescricao = '';
        this.novoPrazo = new Date().toISOString().split('T')[0];
      });
  }

  remover(id: string) {
    if (confirm('Tem certeza?')) {
        this.apollo.mutate({
            mutation: DELETE_TASK,
            variables: { id },
            refetchQueries: [{ query: GET_TAKS }]
        }).subscribe();
        
        if (this.selecionado && this.selecionado.id === id) {
            this.selecionado = null;
        }
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    
    // Recalcula o progresso visualmente na hora (pra ficar rápido)
    this.atualizarEstatisticas();

    const task = event.container.data[event.currentIndex];
    const nomeNovaColuna = event.container.id; 
    const idNovaColuna = this.colunasIds[nomeNovaColuna];

    if (idNovaColuna) {
        this.apollo.mutate({
            mutation: MOVE_TASK,
            variables: {
                input: {
                    taskId: task.id,
                    toColumnId: idNovaColuna,
                    newOrder: event.currentIndex
                }
            }
        }).subscribe();
    }
  }

  abrirDetalhes(task: any) { this.selecionado = task; }
  fecharDetalhes() { this.selecionado = null; }
}