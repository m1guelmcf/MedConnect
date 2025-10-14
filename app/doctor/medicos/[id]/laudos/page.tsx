'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/services/api.mjs';
import { reportsApi } from '@/services/reportsApi.mjs';
import DoctorLayout from '@/components/doctor-layout';

export default function LaudosPage() {
    const [patient, setPatient] = useState(null);
    const [laudos, setLaudos] = useState([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const patientId = params.id as string;

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);

    useEffect(() => {
        if (patientId) {
            const fetchPatientAndLaudos = async () => {
                setLoading(true);
                try {
                    const patientData = await api.get(`/rest/v1/patients?id=eq.${patientId}&select=*`).then(r => r?.[0]);
                    setPatient(patientData);

                    const laudosData = await reportsApi.getReports(patientId);
                    setLaudos(laudosData);
                } catch (error) {
                    console.error("Failed to fetch data:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchPatientAndLaudos();
        }
    }, [patientId]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = laudos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(laudos.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <DoctorLayout>
            <div className="container mx-auto p-4">
                {loading ? (
                    <p>Carregando...</p>
                ) : (
                    <>
                        {patient && (
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle>Informações do Paciente</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p><strong>Nome:</strong> {patient.full_name}</p>
                                    <p><strong>Email:</strong> {patient.email}</p>
                                    <p><strong>Telefone:</strong> {patient.phone_mobile}</p>
                                </CardContent>
                            </Card>
                        )}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Laudos do Paciente</CardTitle>
                                <Link href={`/doctor/medicos/${patientId}/laudos/novo`}>
                                    <Button>Criar Novo Laudo</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nº do Pedido</TableHead>
                                            <TableHead>Exame</TableHead>
                                            <TableHead>Diagnóstico</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Data de Criação</TableHead>
                                            <TableHead>Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentItems.length > 0 ? (
                                            currentItems.map((laudo) => (
                                                <TableRow key={laudo.id}>
                                                    <TableCell>{laudo.order_number}</TableCell>
                                                    <TableCell>{laudo.exam}</TableCell>
                                                    <TableCell>{laudo.diagnosis}</TableCell>
                                                    <TableCell>{laudo.status}</TableCell>
                                                    <TableCell>{new Date(laudo.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Link href={`/doctor/medicos/${patientId}/laudos/${laudo.id}/editar`}>
                                                            <Button variant="outline" size="sm">Editar</Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center">Nenhum laudo encontrado.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                                {totalPages > 1 && (
                                    <div className="flex justify-center space-x-2 mt-4 p-4">
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <Button key={i} onClick={() => paginate(i + 1)} variant={currentPage === i + 1 ? 'default' : 'outline'}>
                                                {i + 1}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </DoctorLayout>
    );
}